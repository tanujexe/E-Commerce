import mongoose from 'mongoose';
import dns from 'dns';

const DEFAULT_DNS_SERVERS = ['8.8.8.8', '1.1.1.1'];

const setDnsServers = () => {
  const dnsServers = process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean)
    : DEFAULT_DNS_SERVERS;

  dns.setServers(dnsServers);
  console.log(`🔧 Using DNS servers: ${dnsServers.join(', ')}`);
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri) {
    console.error('❌ MONGO_URI is not set. Set it in .env or your deployment environment.');
    process.exit(1);
  }

  if (mongoUri.startsWith('mongodb+srv://')) {
    setDnsServers();
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      family: 4,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    if (
      mongoUri.startsWith('mongodb+srv://') &&
      error.code === 'ECONNREFUSED' &&
      error.message.includes('querySrv')
    ) {
      console.log('⚠️ SRV lookup failed. Retrying with public DNS servers...');
      setDnsServers();

      try {
        const conn = await mongoose.connect(mongoUri, {
          family: 4,
        });
        console.log(`✅ MongoDB Connected after DNS retry: ${conn.connection.host}`);
        return;
      } catch (retryError) {
        console.error(`❌ MongoDB Retry Error: ${retryError.message}`);
      }
    }

    process.exit(1);
  }
};

export default connectDB;
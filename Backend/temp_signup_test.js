import http from "http";
import { request } from "http";
import { Buffer } from "buffer";

const data = JSON.stringify({ name: "Test User", email: "testuser+copilot@example.com", password: "secret123" });

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/auth/register",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
  },
};

const req = request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => body += chunk);
  res.on("end", () => {
    console.log(res.statusCode);
    console.log(body);
  });
});

req.on("error", (error) => console.error(error));
req.write(data);
req.end();

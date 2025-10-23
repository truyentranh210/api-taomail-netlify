import express from "express";

const app = express();
app.use(express.json());

// =================== DỮ LIỆU GIỐNG PYTHON ===================
const TEMP_EMAIL_SITES = {
  SHORT_TERM: [
    { name: "10MinuteMail", domain: "10minutemail.com", duration: 600, quality: "⭐⭐⭐⭐⭐" },
    { name: "GuerrillaMail", domain: "guerrillamail.com", duration: 3600, quality: "⭐⭐⭐⭐⭐" },
    { name: "Mailinator", domain: "mailinator.com", duration: 7200, quality: "⭐⭐⭐⭐" },
    { name: "TempMail", domain: "temp-mail.org", duration: 600, quality: "⭐⭐⭐⭐" }
  ],
  LONG_TERM: [
    { name: "YopMail", domain: "yopmail.com", duration: 691200, quality: "⭐⭐⭐⭐⭐" },
    { name: "MailTM", domain: "mail.tm", duration: 172800, quality: "⭐⭐⭐⭐⭐" },
    { name: "TrashMail", domain: "trashmail.com", duration: 604800, quality: "⭐⭐⭐⭐" }
  ]
};

// ============= HÀM HỖ TRỢ =============
function randomString(len = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// =================== CHỨC NĂNG ===================
let emails = [];

function generateEmail(category = "SHORT_TERM") {
  const sites = TEMP_EMAIL_SITES[category];
  const site = randomFrom(sites);
  const username = randomString(10);
  const email = `${username}@${site.domain}`;
  const now = Date.now();

  const data = {
    email,
    site_name: site.name,
    quality: site.quality,
    duration: site.duration,
    duration_display: formatDuration(site.duration),
    created_at: now,
    category
  };
  emails.push(data);
  return data;
}

// =================== ROUTES ===================
app.get("/home", (req, res) => {
  res.json({
    message: "📧 TEMP EMAIL API v3.0",
    usage: {
      "/1": "Tạo email ngắn hạn (SHORT_TERM)",
      "/2": "Tạo email dài hạn (LONG_TERM)",
      "/3": "Tạo nhanh 5 email (Auto Mix)",
      "/4": "Xem thống kê hệ thống",
      "/5": "Hiển thị toàn bộ email đã tạo"
    }
  });
});

app.get("/1", (req, res) => {
  res.json({ success: true, data: generateEmail("SHORT_TERM") });
});

app.get("/2", (req, res) => {
  res.json({ success: true, data: generateEmail("LONG_TERM") });
});

app.get("/3", (req, res) => {
  const batch = [];
  for (let i = 0; i < 5; i++) {
    const type = i % 2 === 0 ? "SHORT_TERM" : "LONG_TERM";
    batch.push(generateEmail(type));
  }
  res.json({ success: true, count: batch.length, data: batch });
});

app.get("/4", (req, res) => {
  const stats = {
    total: emails.length,
    short_term: emails.filter(e => e.category === "SHORT_TERM").length,
    long_term: emails.filter(e => e.category === "LONG_TERM").length
  };
  res.json({ success: true, stats });
});

app.get("/5", (req, res) => {
  res.json({ success: true, total: emails.length, data: emails.slice(-10).reverse() });
});

// =================== EXPORT CHO NETLIFY ===================
export const handler = async (event, context) => {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      app.set("port", port);
      const response = app._router.handle(
        { method: event.httpMethod, url: event.path, query: event.queryStringParameters },
        {
          end: (body) => {
            resolve({
              statusCode: 200,
              headers: { "Content-Type": "application/json" },
              body
            });
          },
          setHeader: () => {},
        },
        () => {}
      );
      server.close();
    });
  });
};

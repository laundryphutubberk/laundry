const bcrypt = require('bcrypt');
const { prisma } = require('../src/core/prisma');
const storage = require('../src/adapters/cloudinaryImageStorage.adapter');
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
const run = async () => {
  const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14); const password = `LaundryImage!${runId}`;
  const uploaded = await storage.uploadLaundryWorkImage({ buffer: PNG, workId: `browser-${runId}`, originalName: 'terminal-evidence.png' });
  try {
    const result = await prisma.$transaction(async (tx) => {
      const resort = await tx.resort.create({ data: { name: `Image Browser Resort ${runId}` } });
      const user = await tx.user.create({ data: { email: `laundry-image-${runId}@example.invalid`, passwordHash: await bcrypt.hash(password, 12), displayName: 'Image Operational Browser Test', role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', active: true } });
      const active = await tx.laundryWork.create({ data: { workNo: `BROWSER-IMAGE-ACTIVE-${runId}`, resortId: resort.id, currentStatus: 'BAG_OPENED', createdById: user.id } });
      const terminal = await tx.laundryWork.create({ data: { workNo: `BROWSER-IMAGE-CLOSED-${runId}`, resortId: resort.id, currentStatus: 'CLOSED', closedAt: new Date(), createdById: user.id } });
      await tx.laundryWorkImage.create({ data: { workId: terminal.id, resortId: resort.id, url: uploaded.secure_url, publicId: uploaded.public_id, provider: 'CLOUDINARY', mimeType: 'image/png', originalName: 'terminal-evidence.png', sizeBytes: uploaded.bytes, caption: 'Terminal Work read-only evidence', uploadedById: user.id } });
      return { user, active, terminal };
    });
    console.log(JSON.stringify({ runId, email: result.user.email, password, activeWorkId: result.active.id, activeUrl: `http://127.0.0.1:5173/workspace/laundry/works/${result.active.id}`, terminalWorkId: result.terminal.id, terminalUrl: `http://127.0.0.1:5173/workspace/laundry/works/${result.terminal.id}` }, null, 2));
  } catch (error) { await storage.deleteLaundryWorkImage(uploaded.public_id); throw error; }
};
run().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => prisma.$disconnect());

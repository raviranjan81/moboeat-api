import os from "os";
import process from "process";

const formatBytes = (bytes) => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
};

const getUptime = () => {
  const seconds = os.uptime();
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
};

export const getServerInfo = async (req, res, next) => {
  try {
    const interfaces = os.networkInterfaces();
    const networkInterfaces = {};
    for (const name in interfaces) {
      const iface = interfaces[name];
      if (iface) {
        networkInterfaces[name] = iface
          .filter((details) => details.family === "IPv4" && !details.internal)
          .map((details) => details.address);
      }
    }

    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || "Unknown";
    const memoryUsage = process.memoryUsage();
    const bootTime = new Date(Date.now() - os.uptime() * 1000).toISOString();

    const info = {
      hostname: os.hostname(),
      platform: os.platform(),
      osType: os.type(),
      osRelease: os.release(),
      architecture: os.arch(),
      uptime: getUptime(),
      nodeVersion: process.version,
      totalMemory: formatBytes(os.totalmem()),
      freeMemory: formatBytes(os.freemem()),
      cpuCores: cpus.length,
      cpuModel,
      networkInterfaces,
      currentUser: os.userInfo().username,
      processId: process.pid,
      workingDirectory: process.cwd(),
      environment: process.env.NODE_ENV || "development",
      loadAverage: os.loadavg(),
      homeDir: os.homedir(),
      tempDir: os.tmpdir(),
      bootTime,
      execArgs: process.argv,
      memoryUsage: {
        rss: formatBytes(memoryUsage.rss),
        heapTotal: formatBytes(memoryUsage.heapTotal),
        heapUsed: formatBytes(memoryUsage.heapUsed),
        external: formatBytes(memoryUsage.external),
      },
      activeHandles: (process._getActiveHandles ? process._getActiveHandles().length : 0),
      activeRequests: (process._getActiveRequests ? process._getActiveRequests().length : 0),
    };

    res.status(200).json({
      response: true,
      data: { info },
    });
  } catch (error) {
    next(error);
  }
};

import { Mongoose } from "mongoose";    
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import limiter from './middleware/rate.limiter.js';
import bodyParser from "body-parser";
import path from "path";
import swaggerUi from "swagger-ui-express";
import compression from "compression";
import { fileURLToPath } from 'url';
import {openAPIDocument} from "./docs/openapi.js";
import v1Routes from "./routes/v1-routes.js";
import { errorHandler } from "./class/AppError.js";
import dotenv from "dotenv";
dotenv.config();

connectDB();

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://82.112.234.91:4000',
    'http://82.112.234.91:4001'
];

const app = express();
app.use(helmet());
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(limiter);
app.use(compression({
    level: 6,
    threshold: 1024,
}));

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/public', (req, res, next) => {
    const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.send('API is working!');
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openAPIDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);


connectDB();


const PORT=process.env.PORT || 3001;

try {
  
  v1Routes(app);
} catch (error) {
  console.error("Error setting up routes:", error);
}

app.get("/test", (req, res) => {
  console.log("Test API hit");
  res.json({ message: "API is working" });
});
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/docs`);
});



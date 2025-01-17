import articleRoutes from "./article.routes.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import commentRoutes from "./comment.routes.js";
import XRoutes from "./X.routes.js";
import visitCountRoutes from "./visitCount.routes.js";

const allRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/article", articleRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/comment", commentRoutes);
  app.use("/api/X", XRoutes);
  app.use("/api/count", visitCountRoutes);
};

export { allRoutes };

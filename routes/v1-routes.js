import { adminAuthRoute, categoryRoute, cityRoute, countryRoute, couponRoute, mainCategoryRoute,  productRoute,  settingRoute, stateRoute, vendorRoute } from "./admin/v1/index.js";
import { adminStaffAuthRoute, adminStaffProductRoute } from "./adminstaff/v1/index.js";
import { homeRoutes, publicProductRoutes, settingRoutes } from "./guest/v1/index.js";
import { cartRoutes, orderRoutes, productUserRoutes, userRoutes, wishlistRoutes } from "./user/v1/index.js";
import { vendorAuthRoute, vendorProductRoute } from "./vendor/v1/index.js";

export default function (app) {
  app.get("/api/admin/v1", (req, res) => {
    res.send("Admin API is working");
  });
  
  app.use("/api/admin/v1", adminAuthRoute);
  app.use("/api/admin/v1/main-category", mainCategoryRoute);
  app.use("/api/admin/v1/category", categoryRoute);
  app.use("/api/admin/v1/product", productRoute);
  app.use("/api/admin/v1", settingRoute);
  app.use("/api/admin/v1/coupon", couponRoute);
  app.use("/api/admin/v1/vendor", vendorRoute);

  app.use("/api/admin/v1/country", countryRoute);
  app.use("/api/admin/v1/state", stateRoute);
  app.use("/api/admin/v1/city", cityRoute);

  app.use("/api/vendor/v1",   vendorAuthRoute);
  app.use("/api/vendor/v1",   vendorProductRoute);

  app.use("/api/admin-staff/v1", adminStaffAuthRoute);
  app.use("/api/admin-staff/v1/product", adminStaffProductRoute);


  app.use("/api/v1", settingRoutes);
  app.use("/api/v1", homeRoutes);
  app.use("/api/v1", publicProductRoutes);


  app.use("/api/user/v1", userRoutes);
  app.use("/api/user/v1", cartRoutes);
  app.use("/api/user/v1", wishlistRoutes);
  app.use("/api/user/v1", orderRoutes);
  app.use("/api/user/v1", productUserRoutes);





}

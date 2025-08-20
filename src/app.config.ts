export default defineAppConfig({
  pages: ["pages/index/index", "pages/stats/stats"],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "公司人数统计",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#666",
    selectedColor: "#1296db",
    backgroundColor: "#fafafa",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/index/index",
        text: "人数统计",
        iconPath: "assets/home.png",
        selectedIconPath: "assets/home-fill.png",
      },
      {
        pagePath: "pages/stats/stats",
        text: "统计趋势",
        iconPath: "assets/logistics-data.png",
        selectedIconPath: "assets/logistics-data-fill.png",
      },
    ],
  },
});

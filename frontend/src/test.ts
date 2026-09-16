import api from "./api/axios";

api.get("/inventory")
  .then((res) => {
    console.log("✅ Backend Connected");
    console.log(JSON.stringify(res.data, null, 2));
  })
  .catch((err) => {
    console.error(err);
  });


import api from "./axios";

export async function testAPI() {
  try {
    const res = await api.get("/inventory");

    console.log("Backend Connected");

    console.log(res.data);
  } catch (err) {
    console.error(err);
  }
}


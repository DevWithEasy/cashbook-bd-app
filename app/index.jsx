import { useRouter } from "expo-router";
import { useEffect } from "react";
import SplashContainer from "../components/SplashContainer";
import { getData } from "../utils/localData";

export default function Index() {
  const router = useRouter();

  const initializeApp = async () => {
    try {
      const isFirst = await getData("app_init");
      if (isFirst === null) {
        router.replace("/welcome");
      } else {
        router.replace("/main");
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    setTimeout(() => initializeApp(), 1000);
  }, []);

  return (
    <SplashContainer/>
  );
}


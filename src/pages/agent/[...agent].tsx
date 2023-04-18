import { type NextPage } from "next";
import DefaultLayout from "../../layout/default";
import Button from "../../components/Button";

import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

const Home: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <DefaultLayout className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-center text-4xl font-bold text-[#C0C0C0]">
        {t("coming-soon")}
      </h1>
      <Button onClick={() => void router.push("/")}>{t("back")}</Button>
    </DefaultLayout>
  );
};

export default Home;

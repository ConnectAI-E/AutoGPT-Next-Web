import React from "react";
import { FaWeixin } from "react-icons/fa";
import Dialog from "./Dialog";
import { useTranslation } from "next-i18next";
import Image from "next/image";

export default function WeChatPayDialog({
  show,
  close,
}: {
  show: boolean;
  close: () => void;
}) {
  const { t } = useTranslation();

  const header = (
    <div className="flex items-center gap-2">
      {t("weChatPay")} <FaWeixin />
    </div>
  );

  return (
    <Dialog header={header} isShown={show} close={close}>
      <div className="text-md relative h-[300px] w-[300px] flex-auto p-2 leading-relaxed">
        <Image
          src="/weChatPay.png"
          alt="weChat"
          loading="eager"
          fill
          priority={true}
          className="object-contain"
        />
      </div>
    </Dialog>
  );
}

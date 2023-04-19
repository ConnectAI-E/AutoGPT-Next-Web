import React from "react";
import { FaQq } from "react-icons/fa";
import Dialog from "./Dialog";
import Image from "next/image";

export default function QQDialog({
  show,
  close,
}: {
  show: boolean;
  close: () => void;
}) {
  const header = (
    <div className="flex items-center gap-2">
      QQ <FaQq />
    </div>
  );

  return (
    <Dialog header={header} isShown={show} close={close}>
      <div className="text-md relative h-[300px] w-[300px] flex-auto p-2 leading-relaxed">
        <Image
          src="/QQ.png"
          alt="QQ"
          loading="eager"
          fill
          priority={true}
          className="object-contain"
        />
      </div>
    </Dialog>
  );
}

import type { ReactNode } from "react";
import React, { useEffect, useRef, useState } from "react";
import {
  FaBrain,
  FaClipboard,
  FaListAlt,
  FaPlayCircle,
  FaSave,
  FaStar,
  FaCopy,
} from "react-icons/fa";
import autoAnimate from "@formkit/auto-animate";
import PopIn from "./motions/popin";
import Expand from "./motions/expand";
import * as htmlToImage from "html-to-image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Button from "./Button";
import { useRouter } from "next/router";
import { clientEnv } from "../env/schema.mjs";
import { useTranslation, Trans } from "next-i18next";

interface ChatWindowProps {
  children?: ReactNode;
  className?: string;
  messages: Message[];
  showWeChatPay: () => void;
}

const messageListId = "chat-window-message-list";

const ChatWindow = ({
  messages,
  children,
  className,
  showWeChatPay,
}: ChatWindowProps) => {
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(["chat", "common"]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    // Use has scrolled if we have scrolled up at all from the bottom
    if (scrollTop < scrollHeight - clientHeight - 10) {
      setHasUserScrolled(true);
    } else {
      setHasUserScrolled(false);
    }
  };

  useEffect(() => {
    // Scroll to bottom on re-renders
    if (scrollRef && scrollRef.current) {
      if (!hasUserScrolled) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  });

  useEffect(() => {
    scrollRef.current && autoAnimate(scrollRef.current);
  }, [messages]);

  return (
    <div
      className={
        "border-translucent flex w-full flex-col rounded-2xl border-2 border-white/20 bg-zinc-900 text-white shadow-2xl drop-shadow-lg " +
        (className ?? "")
      }
    >
      <MacWindowHeader />
      <div
        className="mb-2 mr-2 h-[14em] overflow-y-auto overflow-x-hidden sm-h:h-[17em] md-h:h-[22em] lg-h:h-[30em] "
        ref={scrollRef}
        onScroll={handleScroll}
        id={messageListId}
      >
        {messages.map((message, index) => (
          <ChatMessage key={`${index}-${message.type}`} message={message} />
        ))}
        {children}

        {messages.length === 0 && (
          <>
            {!!clientEnv.NEXT_PUBLIC_STRIPE_DONATION_ENABLED && (
              <Expand delay={0.7} type="spring">
                <DonationMessage showWeChatPay={showWeChatPay} />
              </Expand>
            )}
            <Expand delay={0.8} type="spring">
              <ChatMessage
                message={{
                  type: "system",
                  value: t("create-agent-and-deploy"),
                }}
              />
            </Expand>
            <Expand delay={0.9} type="spring">
              <ChatMessage
                message={{
                  type: "system",
                  value: `📢 ${t("provide-api-key-via-settings")}`,
                }}
              />
            </Expand>
          </>
        )}
      </div>
    </div>
  );
};

const MacWindowHeader = () => {
  const { t } = useTranslation(["chat", "common"]);

  const saveElementAsImage = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
      return;
    }

    htmlToImage
      .toJpeg(element, {
        height: element.scrollHeight,
        style: {
          overflowY: "visible",
          maxHeight: "none",
          border: "none",
        },
      })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "auto-gpt-output.png";
        link.click();
      })
      .catch(console.error);
  };

  const copyElementText = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
      return;
    }

    const text = element.innerText;
    void navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex items-center gap-1 rounded-t-3xl p-3">
      <PopIn delay={0.4}>
        <div className="h-3 w-3 rounded-full bg-red-500" />
      </PopIn>
      <PopIn delay={0.5}>
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
      </PopIn>
      <PopIn delay={0.6}>
        <div className="h-3 w-3 rounded-full bg-green-500" />
      </PopIn>
      <div className="flex flex-grow"></div>
      <PopIn delay={0.7}>
        <div
          className="mr-1 flex cursor-pointer items-center gap-2 rounded-full border-2 border-white/30 p-1 px-2 text-xs hover:bg-white/10"
          onClick={(): void => saveElementAsImage(messageListId)}
        >
          <FaSave size={12} />
          <p className="font-mono">{t("common:save")}</p>
        </div>
      </PopIn>

      <PopIn delay={0.8}>
        <div
          className="mr-1 flex cursor-pointer items-center gap-2 rounded-full border-2 border-white/30 p-1 px-2 text-xs hover:bg-white/10"
          onClick={(): void => copyElementText(messageListId)}
        >
          <FaClipboard size={12} />
          <p className="font-mono">{t("common:copy")}</p>
        </div>
      </PopIn>
    </div>
  );
};
const ChatMessage = ({ message }: { message: Message }) => {
  const { t } = useTranslation(["chat", "common"]);
  const [showCopy, setShowCopy] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopyClick = () => {
    void navigator.clipboard.writeText(message.value);
    setCopied(true);
  };
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (copied) {
      timeoutId = setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [copied]);
  return (
    <div
      className="mx-2 my-1 rounded-lg border-[2px] border-white/10 bg-white/20 p-1 font-mono text-sm hover:border-[#1E88E5]/40 sm:mx-4 sm:p-3 sm:text-base"
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => setShowCopy(false)}
      onClick={handleCopyClick}
    >
      {message.type != "system" && (
        // Avoid for system messages as they do not have an icon and will cause a weird space
        <>
          <div className="mr-2 inline-block h-[0.9em]">
            {getMessageIcon(message)}
          </div>
          <span className="mr-2 font-bold">{getMessagePrefix(message)}</span>
        </>
      )}

      {message.type == "thinking" && (
        <span className="italic text-zinc-400">({t("restart")})</span>
      )}

      {message.type == "action" ? (
        <div className="prose ml-2 max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {message.value}
          </ReactMarkdown>
        </div>
      ) : (
        <span>{t(message.value)}</span>
      )}

      <div className="relative">
        {copied ? (
          <span className="absolute bottom-0 right-0 rounded-full border-2 border-white/30 bg-zinc-800 p-1 px-2 text-gray-300">
            {t("common:copied")}!
          </span>
        ) : (
          <span
            className={`absolute bottom-0 right-0 rounded-full border-2 border-white/30 bg-zinc-800 p-1 px-2 ${
              showCopy ? "visible" : "hidden"
            }`}
          >
            <FaCopy className="text-white-300 cursor-pointer" />
          </span>
        )}
      </div>
    </div>
  );
};

const DonationMessage = ({ showWeChatPay }: { showWeChatPay: () => void }) => {
  const { t } = useTranslation(["chat", "common"]);

  return (
    <div className="mx-2 my-1 flex flex-col gap-2 rounded-lg border-[2px] border-white/10 bg-blue-500/20 p-1 font-mono hover:border-[#1E88E5]/40 sm:mx-4 sm:flex-row sm:p-3 sm:text-center sm:text-base">
      <div className="max-w-none flex-grow">
        <Trans i18nKey="donate-help" ns="chat">
          💝️ Help support the advancement of AutoGPT Next Web. 💝 <br /> Please
          consider donating help fund our high infrastructure costs.
        </Trans>
      </div>
      <div className="flex items-center justify-center">
        <Button
          className="sm:text m-0 rounded-full text-sm "
          onClick={showWeChatPay}
        >
          {t("donate-now")} 🚀
        </Button>
      </div>
    </div>
  );
};

const getMessageIcon = (message: Message) => {
  switch (message.type) {
    case "goal":
      return <FaStar className="text-yellow-300" />;
    case "task":
      return <FaListAlt className="text-gray-300" />;
    case "thinking":
      return <FaBrain className="mt-[0.1em] text-pink-400" />;
    case "action":
      return <FaPlayCircle className="text-green-500" />;
  }
};

const getMessagePrefix = (message: Message) => {
  const { t } = useTranslation(["chat", "common"]);

  switch (message.type) {
    case "goal":
      return t("new-goal");
    case "task":
      return t("added-task");
    case "thinking":
      return t("thinking");
    case "action":
      return message.info ? message.info : "Executing:";
  }
};

export interface Message {
  type: "goal" | "thinking" | "task" | "action" | "system";
  info?: string;
  value: string;
}

export default ChatWindow;
export { ChatMessage };

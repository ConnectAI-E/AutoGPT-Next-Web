import type { ReactNode } from "react";
import React, { useEffect, useRef, useState } from "react";
import { FaClipboard, FaImage, FaSave, FaPlay, FaPause } from "react-icons/fa";
import PopIn from "./motions/popin";
import Expand from "./motions/expand";
import * as htmlToImage from "html-to-image";
import WindowButton from "./WindowButton";
import PDFButton from "./pdf/PDFButton";
import FadeIn from "./motions/FadeIn";
import Menu from "./Menu";
import type { Message } from "../types/agentTypes";
import {
  isAction,
  getTaskStatus,
  MESSAGE_TYPE_GOAL,
  MESSAGE_TYPE_THINKING,
  MESSAGE_TYPE_SYSTEM,
  TASK_STATUS_STARTED,
  TASK_STATUS_EXECUTING,
  TASK_STATUS_COMPLETED,
  TASK_STATUS_FINAL,
  PAUSE_MODE,
  AUTOMATIC_MODE,
} from "../types/agentTypes";
import clsx from "clsx";
import { getMessageContainerStyle, getTaskStatusIcon } from "./utils/helpers";
import { useAgentStore } from "./stores";
import { AnimatePresence } from "framer-motion";
import { CgExport } from "react-icons/cg";
import MarkdownRenderer from "./MarkdownRenderer";
import { Switch } from "./Switch";
import { env } from "../env/client.mjs";
import { useTranslation, Trans } from "next-i18next";

interface ChatWindowProps extends HeaderProps {
  children?: ReactNode;
  className?: string;
  fullscreen?: boolean;
  scrollToBottom?: boolean;
  displaySettings?: boolean;
  openSorryDialog?: () => void;
}

const messageListId = "chat-window-message-list";

const ChatWindow = ({
  messages,
  children,
  className,
  title,
  onSave,
  fullscreen,
  scrollToBottom,
  displaySettings,
  openSorryDialog,
}: ChatWindowProps) => {
  const { t } = useTranslation(["chat", "common"]);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAgentPaused = useAgentStore.use.isAgentPaused();
  const agentMode = useAgentStore.use.agentMode();
  const agent = useAgentStore.use.agent();
  const isWebSearchEnabled = useAgentStore.use.isWebSearchEnabled();
  const setIsWebSearchEnabled = useAgentStore.use.setIsWebSearchEnabled();
  const updateAgentMode = useAgentStore.use.updateAgentMode();

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    // Use has scrolled if we have scrolled up at all from the bottom
    const hasUserScrolled = scrollTop < scrollHeight - clientHeight - 10;
    setHasUserScrolled(hasUserScrolled);
  };

  useEffect(() => {
    // Scroll to bottom on re-renders
    if (scrollToBottom && scrollRef && scrollRef.current) {
      if (!hasUserScrolled) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  });

  const handleChangeWebSearch = (value: boolean) => {
    // Change this value when we can no longer support web search
    const WEB_SEARCH_ALLOWED = env.NEXT_PUBLIC_WEB_SEARCH_ENABLED as boolean;

    if (WEB_SEARCH_ALLOWED) {
      setIsWebSearchEnabled(value);
    } else {
      openSorryDialog?.();
      setIsWebSearchEnabled(false);
    }
  };

  const messageDepth = (messages: Message[], message: Message, depth = 0) => {
    if (depth > 5) {
      return depth;
    }
    const index = messages.findLastIndex(
      (i: Message) => i.parentTaskId && i.taskId === message.taskId
    );
    if (index > -1) {
      const { parentTaskId } = messages[index] as Message;
      if (parentTaskId) {
        const parentIndex = messages.findLastIndex(
          (i: Message) => i.taskId && i.taskId === parentTaskId
        );
        if (parentIndex > -1) {
          return messageDepth(
            messages,
            messages[parentIndex] as Message,
            depth + 1
          );
        }
      }
    }
    return depth;
  };

  const handleUpdateAgentMode = (value: boolean) => {
    updateAgentMode(value ? PAUSE_MODE : AUTOMATIC_MODE);
  };

  return (
    <div
      className={
        "border-translucent flex w-full flex-col rounded-2xl border-2 border-white/20 bg-zinc-900 text-white shadow-2xl drop-shadow-lg " +
        (className ?? "")
      }
    >
      <MacWindowHeader title={title} messages={messages} onSave={onSave} />
      <div
        className={clsx(
          "mb-2 mr-2 ",
          (fullscreen && "max-h-[75vh] flex-grow overflow-auto") ||
            "window-heights"
        )}
        ref={scrollRef}
        onScroll={handleScroll}
        id={messageListId}
      >
        {agent !== null && agentMode === PAUSE_MODE && isAgentPaused && (
          <FaPause className="animation-hide absolute left-1/2 top-1/2 text-lg md:text-3xl" />
        )}
        {agent !== null && agentMode === PAUSE_MODE && !isAgentPaused && (
          <FaPlay className="animation-hide absolute left-1/2 top-1/2 text-lg md:text-3xl" />
        )}
        {messages.map((message, index) => {
          if (getTaskStatus(message) === TASK_STATUS_EXECUTING) {
            return null;
          }

          return (
            <FadeIn key={`${index}-${message.type}`}>
              <ChatMessage
                message={message}
                depth={messageDepth(messages, message, 0)}
              />
            </FadeIn>
          );
        })}
        {children}

        {messages.length === 0 && (
          <>
            <Expand delay={0.8} type="spring">
              <ChatMessage
                message={{
                  type: MESSAGE_TYPE_SYSTEM,
                  value: t("create-agent-and-deploy"),
                }}
              />
            </Expand>
            <Expand delay={0.9} type="spring">
              <ChatMessage
                message={{
                  type: MESSAGE_TYPE_SYSTEM,
                  value: `📢 ${t("provide-api-key-via-settings")}`,
                }}
              />
            </Expand>
          </>
        )}
      </div>
      {displaySettings && (
        <div className="flex flex-col items-center justify-center md:flex-row">
          <SwitchContainer label={t("web-search")}>
            <Switch
              disabled={agent !== null}
              value={isWebSearchEnabled}
              onChange={handleChangeWebSearch}
            />
          </SwitchContainer>
          <SwitchContainer label={t("pause-mode")}>
            <Switch
              disabled={agent !== null}
              value={agentMode === PAUSE_MODE}
              onChange={handleUpdateAgentMode}
            />
          </SwitchContainer>
        </div>
      )}
    </div>
  );
};

const SwitchContainer = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="m-1 flex w-36 items-center justify-center gap-2 rounded-lg border-[2px] border-white/20 bg-zinc-700 px-2 py-1">
      <p className="font-mono text-sm">{label}</p>
      {children}
    </div>
  );
};

interface HeaderProps {
  title?: string | ReactNode;
  messages: Message[];
  onSave?: (format: string) => void;
}

const MacWindowHeader = (props: HeaderProps) => {
  const { t } = useTranslation(["chat", "common"]);
  const isAgentPaused = useAgentStore.use.isAgentPaused();
  const agent = useAgentStore.use.agent();
  const agentMode = useAgentStore.use.agentMode();
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
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
      } catch (err) {}

      document.body.removeChild(textArea);
    }
  };

  const exportOptions = [
    <WindowButton
      key="Image"
      onClick={(): void => saveElementAsImage(messageListId)}
      icon={<FaImage size={12} />}
      name={t("common:image")}
    />,
    <WindowButton
      key="Copy"
      onClick={(): void => copyElementText(messageListId)}
      icon={<FaClipboard size={12} />}
      name={t("common:copy")}
    />,
    <PDFButton key="PDF" name="PDF" messages={props.messages} />,
  ];

  return (
    <div className="flex items-center gap-1 overflow-visible rounded-t-3xl p-3">
      <PopIn delay={0.4}>
        <div className="h-3 w-3 rounded-full bg-red-500" />
      </PopIn>
      <PopIn delay={0.5}>
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
      </PopIn>
      <PopIn delay={0.6}>
        <div className="h-3 w-3 rounded-full bg-green-500" />
      </PopIn>
      <Expand
        delay={1}
        className="invisible flex flex-grow font-mono text-sm font-bold text-gray-500 sm:ml-2 md:visible"
      >
        {props.title}
      </Expand>

      <AnimatePresence>
        {props.onSave && (
          <PopIn>
            <WindowButton
              ping
              key="Agent"
              onClick={() => props.onSave?.("db")}
              icon={<FaSave size={12} />}
              name={t("common:save")}
              styleClass={{
                container: `relative bg-[#3a3a3a] md:w-20 text-center font-mono rounded-lg text-gray/50 border-[2px] border-white/30 font-bold transition-all sm:py-0.5 hover:border-[#1E88E5]/40 hover:bg-[#6b6b6b] focus-visible:outline-none focus:border-[#1E88E5]`,
              }}
            />
          </PopIn>
        )}
      </AnimatePresence>

      {agentMode === PAUSE_MODE && agent !== null && (
        <div
          className={`animation-duration text-gray/50 flex items-center gap-2 px-2 py-1 text-left font-mono text-sm font-bold transition-all sm:py-0.5`}
        >
          {isAgentPaused ? (
            <>
              <FaPause />
              <p className="font-mono">{t("common:paused")}</p>
            </>
          ) : (
            <>
              <FaPlay />
              <p className="font-mono">{t("common:running")}</p>
            </>
          )}
        </div>
      )}

      <Menu
        icon={<CgExport />}
        name={t("common:export")}
        onChange={() => null}
        items={exportOptions}
        styleClass={{
          container: "relative",
          input: `bg-[#3a3a3a] animation-duration text-left py-1 px-2 text-sm font-mono rounded-lg text-gray/50 border-[2px] border-white/30 font-bold transition-all sm:py-0.5 hover:border-[#1E88E5]/40 hover:bg-[#6b6b6b] focus-visible:outline-none focus:border-[#1E88E5]`,
          option: "w-full py-[1px] md:py-0.5",
        }}
      />
    </div>
  );
};
const ChatMessage = ({
  message,
  depth = 0,
}: {
  message: Message;
  depth?: number;
}) => {
  const { t } = useTranslation(["chat", "common"]);
  const [copied, setCopied] = useState(false);
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
      className={`${getMessageContainerStyle(
        message
      )} mx-2 my-1 rounded-lg border-[2px] bg-white/20 p-1 font-mono text-sm hover:border-[#1E88E5]/40 sm:mx-4 sm:p-3 sm:text-base`}
      style={{ marginLeft: `${depth * 40 + 20}px` }}
    >
      {message.type != MESSAGE_TYPE_SYSTEM && (
        // Avoid for system messages as they do not have an icon and will cause a weird space
        <>
          <div className="mr-2 inline-block h-[0.9em]">
            {getTaskStatusIcon(message, {})}
          </div>
          <span className="mr-2 font-bold">{getMessagePrefix(message)}</span>
        </>
      )}

      {message.type == MESSAGE_TYPE_THINKING && (
        <span className="italic text-zinc-400">{t("restart")}</span>
      )}

      {isAction(message) ? (
        <>
          <hr className="my-2 border-[1px] border-white/20" />
          <div className="prose max-w-none">
            <MarkdownRenderer>{message.info || ""}</MarkdownRenderer>
          </div>
        </>
      ) : (
        <>
          <span>{message.value}</span>
          <br />
          {
            // Link to the FAQ if it is a shutdown message
            message.type == MESSAGE_TYPE_SYSTEM &&
              (message.value.toLowerCase().includes("shut") ||
                message.value.toLowerCase().includes("error")) && <FAQ />
          }
        </>
      )}
    </div>
  );
};

const getMessagePrefix = (message: Message) => {
  const { t } = useTranslation("chat");
  if (message.type === MESSAGE_TYPE_GOAL) {
    return t("new-goal");
  } else if (message.type === MESSAGE_TYPE_THINKING) {
    return t("thinking");
  } else if (getTaskStatus(message) === TASK_STATUS_STARTED) {
    return t("added-task");
  } else if (getTaskStatus(message) === TASK_STATUS_COMPLETED) {
    return `${t("completing")}${message.value}`;
  } else if (getTaskStatus(message) === TASK_STATUS_FINAL) {
    return t("no-more-tasks");
  }
  return "";
};

const FAQ = () => {
  return (
    <Trans i18nKey="faq" ns="chat">
      <p>
        If you are facing issues, please head over to our&nbsp;
        <a
          href="https://github.com/Dogtiti/AutoGPT-Next-Web/issues"
          className="text-sky-500"
        >
          Issue
        </a>
      </p>
    </Trans>
  );
};

export default ChatWindow;
export { ChatMessage };

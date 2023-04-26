import React, { useEffect, useRef, useState } from "react";
import { type NextPage, type GetStaticProps } from "next";
import DefaultLayout from "../layout/default";
import ChatWindow from "../components/ChatWindow";
import Drawer from "../components/Drawer";
import Input from "../components/Input";
import Button from "../components/Button";
import { FaRobot, FaStar } from "react-icons/fa";
import { VscLoading } from "react-icons/vsc";
import AutonomousAgent from "../components/AutonomousAgent";
import Expand from "../components/motions/expand";
import HelpDialog from "../components/HelpDialog";
import { SettingsDialog } from "../components/SettingsDialog";
import { TaskWindow } from "../components/TaskWindow";
import { useAuth } from "../hooks/useAuth";
import type { Message } from "../types/agentTypes";
import { useAgent } from "../hooks/useAgent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import WeChatDialog from "../components/WeChatDialog";
import WeChatPayDialog from "../components/WeChatPayDialog";
import QQDialog from "../components/QQDialog";
import KnowlegePlanetDialog from "../components/KnowlegePlanetDialog";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { isEmptyOrBlank } from "../utils/whitespace";
import { useSettings } from "../hooks/useSettings";
import { useGuestMode } from "../hooks/useGuestMode";
import { authEnabled } from "../utils/env-helper";

const Home: NextPage = () => {
  const { t, i18n } = useTranslation();
  const { session, status } = useAuth();
  const [name, setName] = useState<string>("");
  const [goalInput, setGoalInput] = useState<string>("");
  const [agent, setAgent] = useState<AutonomousAgent | null>(null);
  const [shouldAgentStop, setShouldAgentStop] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [showWeChatDialog, setShowWeChatDialog] = useState(false);
  const [showWeChatPayDialog, setShowWeChatPayDialog] = useState(false);
  const [showQQDialog, setShowQQDialog] = useState(false);
  const [showKnowlegePlanetDialog, setShowKnowlegePlanetDialog] =
    useState(false);
  const [customLanguage, setCustomLanguage] = useState<string>(i18n.language);
  const { settings, saveSettings } = useSettings({ customLanguage });
  const { isValidGuest, isGuestMode } = useGuestMode(settings.guestKey);

  const router = useRouter();
  const agentUtils = useAgent();

  useEffect(() => {
    const key = "agentgpt-modal-opened-new";
    const savedModalData = localStorage.getItem(key);

    // Momentarily always run
    setTimeout(() => {
      if (savedModalData == null) {
        setShowHelpDialog(true);
      }
    }, 3000);

    localStorage.setItem(key, JSON.stringify(true));
  }, []);

  const nameInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    nameInputRef?.current?.focus();
  }, []);

  useEffect(() => {
    if (agent == null) {
      setShouldAgentStop(false);
    }
  }, [agent]);

  const handleAddMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const tasks = messages.filter((message) => message.type === "task");

  const disableDeployAgent =
    agent != null || isEmptyOrBlank(name) || isEmptyOrBlank(goalInput);

  const handleNewGoal = () => {
    const agent = new AutonomousAgent(
      name.trim(),
      goalInput.trim(),
      handleAddMessage,
      () => setAgent(null),
      settings,
      { isValidGuest, isGuestMode },
      session ?? undefined
    );
    setAgent(agent);
    setHasSaved(false);
    setMessages([]);
    agent.run().then(console.log).catch(console.error);
  };

  const handleKeyPress = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !disableDeployAgent) {
      if (!e.shiftKey) {
        // Only Enter is pressed, execute the function
        handleNewGoal();
      }
    }
  };

  const handleStopAgent = () => {
    setShouldAgentStop(true);
    agent?.stopAgent();
  };

  const handleLanguageChange = () => {
    const { pathname, asPath, query, locale } = router;
    const lng = locale === "en" ? "zh" : "en";
    router.push({ pathname, query }, asPath, {
      locale: lng,
    });
    setCustomLanguage(lng);
  };

  const proTitle = (
    <>
      AutoGPT Next Web<span className="ml-1 text-amber-500/90">Pro</span>
    </>
  );

  const shouldShowSave =
    status === "authenticated" &&
    !agent?.isRunning &&
    messages.length &&
    !hasSaved;

  const showDonation =
    authEnabled && status !== "loading" && !session?.user.subscriptionId;

  return (
    <DefaultLayout>
      <HelpDialog
        show={showHelpDialog}
        close={() => setShowHelpDialog(false)}
      />
      <SettingsDialog
        customSettings={[settings, saveSettings]}
        show={showSettingsDialog}
        close={() => setShowSettingsDialog(false)}
      />
      <WeChatDialog
        show={showWeChatDialog}
        close={() => setShowWeChatDialog(false)}
      />
      <WeChatPayDialog
        show={showWeChatPayDialog}
        close={() => setShowWeChatPayDialog(false)}
      />
      <QQDialog show={showQQDialog} close={() => setShowQQDialog(false)} />
      <KnowlegePlanetDialog
        show={showKnowlegePlanetDialog}
        close={() => setShowKnowlegePlanetDialog(false)}
      />
      <main className="flex min-h-screen flex-row">
        <Drawer
          showHelp={() => setShowHelpDialog(true)}
          showSettings={() => setShowSettingsDialog(true)}
          showWeChat={() => setShowWeChatDialog(true)}
          showQQ={() => setShowQQDialog(true)}
          showKnowledgePlanet={() => setShowKnowlegePlanetDialog(true)}
          handleLanguageChange={handleLanguageChange}
        />
        <div
          id="content"
          className="z-10 flex min-h-screen w-full items-center justify-center p-2 px-2 sm:px-4 md:px-10"
        >
          <div
            id="layout"
            className="flex h-full w-full max-w-screen-lg flex-col items-center justify-between gap-3 py-5 md:justify-center"
          >
            <div
              id="title"
              className="relative flex flex-col items-center font-mono"
            >
              <div className="flex flex-row items-start shadow-2xl">
                <span className="text-4xl font-bold text-[#C0C0C0] xs:text-5xl sm:text-6xl">
                  Auto
                </span>
                <span className="text-4xl font-bold text-white xs:text-5xl sm:text-6xl">
                  GPT.
                </span>
                <span className="text-4xl font-bold text-white xs:text-5xl sm:text-6xl">
                  NextWeb
                </span>
              </div>
              <div className="mt-1 text-center font-mono text-[0.7em] font-bold text-white">
                <p>{t("sub-title")}</p>
              </div>
            </div>

            <Expand className="flex w-full flex-row">
              <ChatWindow
                className="sm:mt-4"
                messages={messages}
                title={session?.user.subscriptionId ? proTitle : "AutoGPT"}
                showDonation={showDonation}
                onSave={
                  shouldShowSave
                    ? (format) => {
                        setHasSaved(true);
                        agentUtils.saveAgent({
                          goal: goalInput.trim(),
                          name: name.trim(),
                          tasks: messages,
                        });
                      }
                    : undefined
                }
                scrollToBottom
                showWeChatPay={() => setShowWeChatPayDialog(true)}
              />
              {tasks.length > 0 && <TaskWindow tasks={tasks} />}
            </Expand>

            <div className="flex w-full flex-col gap-2 sm:mt-4 md:mt-10">
              <Expand delay={1.2}>
                <Input
                  inputRef={nameInputRef}
                  left={
                    <>
                      <FaRobot />
                      <span className="ml-2">{t("agent-name")}</span>
                    </>
                  }
                  value={name}
                  disabled={agent != null}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e)}
                  placeholder="AutoGPT"
                />
              </Expand>
              <Expand delay={1.3}>
                <Input
                  left={
                    <>
                      <FaStar />
                      <span className="ml-2">{t("goal")}</span>
                    </>
                  }
                  disabled={agent != null}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e)}
                  placeholder="Make the world a better place."
                />
              </Expand>
            </div>

            <Expand delay={1.4} className="flex gap-2">
              <Button
                disabled={disableDeployAgent}
                onClick={handleNewGoal}
                className="sm:mt-10"
              >
                {agent == null ? (
                  t("deploy-agent")
                ) : (
                  <>
                    <VscLoading className="animate-spin" size={20} />
                    <span className="ml-2">{t("running")}</span>
                  </>
                )}
              </Button>

              <Button
                disabled={agent == null}
                onClick={handleStopAgent}
                className="sm:mt-10"
                enabledClassName={"bg-red-600 hover:bg-red-400"}
              >
                {shouldAgentStop ? (
                  <>
                    <VscLoading className="animate-spin" size={20} />
                    <span className="ml-2">{t("stopping")}</span>
                  </>
                ) : (
                  <span>{t("stop-agent")}</span>
                )}
              </Button>
            </Expand>
          </div>
        </div>
      </main>
    </DefaultLayout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "zh", [
      "common",
      "help",
      "settings",
      "chat",
    ])),
  },
});

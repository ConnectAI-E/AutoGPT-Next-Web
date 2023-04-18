import React, { useState } from "react";
import {
  FaBars,
  FaCog,
  FaDiscord,
  FaGithub,
  FaQuestionCircle,
  FaRobot,
  FaSignInAlt,
  FaSignOutAlt,
  FaTwitter,
  FaUser,
  FaLanguage,
  FaWeixin,
  FaQq,
  FaGlobe,
} from "react-icons/fa";
import { BiPlus } from "react-icons/bi";
import clsx from "clsx";
import { useAuth } from "../hooks/useAuth";
import type { Session } from "next-auth";
import { env } from "../env/client.mjs";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const Drawer = ({
  showHelp,
  showSettings,
  showWeChat,
  showQQ,
  showKnowledgePlanet,
}: {
  showHelp: () => void;
  showSettings: () => void;
  showWeChat: () => void;
  showQQ: () => void;
  showKnowledgePlanet: () => void;
}) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const { session, signIn, signOut, status } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  // TODO: enable for crud
  // const [animationParent] = useAutoAnimate();s
  // const query = api.agent.getAll.useQuery(undefined, {
  //   enabled:
  //     status == "authenticated" && env.NEXT_PUBLIC_VERCEL_ENV != "production",
  // });
  // const router = useRouter();
  //
  const userAgents = [];

  const toggleDrawer = () => {
    setShowDrawer((prevState) => !prevState);
  };

  const onToggleLanguageClick = () => {
    const { pathname, asPath, query, locale } = router;
    router.push({ pathname, query }, asPath, {
      locale: locale === "en" ? "zh" : "en",
    });
  };

  return (
    <>
      <button
        hidden={showDrawer}
        className="fixed left-2 top-2 z-40 rounded-md border-2 border-white/20 bg-zinc-900 p-2 text-white hover:bg-zinc-700 md:hidden"
        onClick={toggleDrawer}
      >
        <FaBars />
      </button>
      <div
        id="drawer"
        className={clsx(
          showDrawer ? "translate-x-0" : "-translate-x-full",
          "z-30 m-0 h-screen w-72 flex-col justify-between bg-zinc-900 p-3 font-mono text-white shadow-3xl transition-all",
          "fixed top-0 md:sticky",
          "flex md:translate-x-0"
        )}
      >
        <div className="flex flex-col gap-1 overflow-hidden">
          <div className="mb-2 flex justify-center gap-2">
            <DrawerItem
              className="flex-grow"
              icon={<BiPlus />}
              border
              text="new-agent"
              onClick={() => location.reload()}
            />
            <button
              className="z-40 rounded-md border-2 border-white/20 bg-zinc-900 p-2 text-white hover:bg-zinc-700 md:hidden"
              onClick={toggleDrawer}
            >
              <FaBars />
            </button>
          </div>
          {/*{TODO: enable for crud}*/}
          <ul>
            {/*  {userAgents.map((agent, index) => (*/}
            {/*    <DrawerItem*/}
            {/*      key={index}*/}
            {/*      icon={<FaRobot />}*/}
            {/*      text={agent.name}*/}
            {/*      className={""}*/}
            {/*      onClick={() => void router.push(`/agent/${agent.id}`)}*/}
            {/*    />*/}
            {/*  ))}*/}

            {userAgents.length === 0 && <div>{t("restart-agent")}</div>}
          </ul>
        </div>

        <div className="flex flex-col gap-1">
          <hr className="my-5 border-white/20" />
          {/*<DrawerItem*/}
          {/*  icon={<FaTrashAlt />}*/}
          {/*  text="Clear Agents"*/}
          {/*  onClick={() => setAgents([])}*/}
          {/*/>*/}

          {env.NEXT_PUBLIC_FF_AUTH_ENABLED && (
            <AuthItem session={session} signIn={signIn} signOut={signOut} />
          )}

          <DrawerItem
            icon={<FaQuestionCircle />}
            text="help"
            onClick={showHelp}
          />
          <DrawerItem icon={<FaCog />} text="settings" onClick={showSettings} />
          <DrawerItem
            icon={<FaWeixin />}
            text="weChat"
            target="_blank"
            onClick={showWeChat}
          />
          <DrawerItem
            icon={<FaQq />}
            text="QQ"
            target="_blank"
            onClick={showQQ}
          />
          <DrawerItem
            icon={<FaGlobe />}
            text="knowlege-planet"
            target="_blank"
            onClick={showKnowledgePlanet}
          />
          <DrawerItem
            icon={<FaDiscord />}
            text="Discord"
            href="https://discord.gg/Xnsbhg6Uvd"
            target="_blank"
          />
          <DrawerItem
            icon={<FaGithub />}
            text="GitHub"
            href="https://github.com/Dogtiti/AutoGPT-Next-Web"
            target="_blank"
          />
          <DrawerItem
            icon={<FaLanguage />}
            text="language"
            onClick={onToggleLanguageClick}
          />
        </div>
      </div>
    </>
  );
};

interface DrawerItemProps
  extends Pick<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "target"
  > {
  icon: React.ReactNode;
  text: string;
  border?: boolean;
  onClick?: () => void;
  className?: string;
}

const DrawerItem = (props: DrawerItemProps) => {
  const { icon, text, border, href, target, onClick, className } = props;
  const { t } = useTranslation();

  if (href) {
    return (
      <a
        className={clsx(
          "flex cursor-pointer flex-row items-center rounded-md rounded-md p-2 hover:bg-white/5",
          border && "border-[1px] border-white/20",
          `${className || ""}`
        )}
        href={href}
        target={target ?? "_blank"}
      >
        {icon}
        <span className="text-md ml-4">{t(text)}</span>
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={clsx(
          "flex cursor-pointer flex-row items-center rounded-md rounded-md p-2 hover:bg-white/5",
          border && "border-[1px] border-white/20",
          `${className || ""}`
        )}
        onClick={onClick}
      >
        {icon}
        <span className="text-md ml-4">{t(text)}</span>
      </button>
    );
  }
};

const AuthItem: React.FC<{
  session: Session | null;
  signIn: () => void;
  signOut: () => void;
}> = ({ signIn, signOut, session }) => {
  const icon = session?.user ? <FaSignInAlt /> : <FaSignOutAlt />;
  const text = session?.user ? "Sign Out" : "Sign In";
  const onClick = session?.user ? signOut : signIn;

  return <DrawerItem icon={icon} text={text} onClick={onClick} />;
};

export default Drawer;

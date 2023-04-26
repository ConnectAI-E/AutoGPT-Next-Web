import React, { useState, Fragment } from "react";
import {
  FaBars,
  FaCog,
  FaDiscord,
  FaGithub,
  FaQuestionCircle,
  FaRobot,
  FaRocket,
  FaSignInAlt,
  FaSignOutAlt,
  FaUser,
  FaLanguage,
  FaWeixin,
  FaQq,
  FaGlobe,
} from "react-icons/fa";
import clsx from "clsx";
import { useAuth } from "../hooks/useAuth";
import type { Session } from "next-auth";
import { env } from "../env/client.mjs";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { api } from "../utils/api";
import { signIn } from "next-auth/react";
import { authEnabled } from "../utils/env-helper";

const Drawer = ({
  showHelp,
  showSettings,
  showWeChat,
  showQQ,
  showKnowledgePlanet,
  handleLanguageChange,
}: {
  showHelp: () => void;
  showSettings: () => void;
  showWeChat: () => void;
  showQQ: () => void;
  showKnowledgePlanet: () => void;
  handleLanguageChange: () => void;
}) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const { session, signIn, signOut, status } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const sub = api.account.subscribe.useMutation({
    onSuccess: async (url) => {
      if (!url) return;
      await router.push(url);
    },
  });

  const query = api.agent.getAll.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const manage = api.account.manage.useMutation({
    onSuccess: async (url: any) => {
      if (!url) return;
      await router.push(url);
    },
  });

  const toggleDrawer = () => {
    setShowDrawer((prevState) => !prevState);
  };

  const userAgents = query.data ?? [];

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
            {authEnabled ? t("my-agents") : t("create-agent")}
            <button
              className="z-40 rounded-md border-2 border-white/20 bg-zinc-900 p-2 text-white hover:bg-zinc-700 md:hidden"
              onClick={toggleDrawer}
            >
              <FaBars />
            </button>
          </div>
          <ul className="flex flex-col gap-2 overflow-auto">
            {userAgents.map((agent, index) => (
              <DrawerItem
                key={index}
                icon={<FaRobot />}
                text={agent.name}
                className="w-full"
                onClick={() => void router.push(`/agent?id=${agent.id}`)}
              />
            ))}

            {authEnabled && status === "unauthenticated" && (
              <div>{t("sign-in-tips")}</div>
            )}
            {authEnabled &&
              status === "authenticated" &&
              userAgents.length === 0 && <div>{t("create-agent")}</div>}
          </ul>
        </div>

        <div className="flex flex-col gap-1">
          <hr className="my-5 border-white/20" />
          {/*<DrawerItem*/}
          {/*  icon={<FaTrashAlt />}*/}
          {/*  text="Clear Agents"*/}
          {/*  onClick={() => setAgents([])}*/}
          {/*/>*/}

          {authEnabled && (
            <AuthItem session={session} signIn={signIn} signOut={signOut} />
          )}

          <DrawerItem
            icon={<FaQuestionCircle />}
            text="help"
            onClick={showHelp}
          />
          <DrawerItem icon={<FaCog />} text="settings" onClick={showSettings} />
          {authEnabled && (
            <Fragment>
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
            </Fragment>
          )}
          <DrawerItem
            icon={<FaGithub />}
            text="GitHub"
            href="https://github.com/Dogtiti/AutoGPT-Next-Web"
            target="_blank"
          />
          <DrawerItem
            icon={<FaLanguage />}
            text="language"
            onClick={handleLanguageChange}
          />
          {env.NEXT_PUBLIC_FF_SUB_ENABLED ||
            (router.query.pro && (
              <ProItem
                sub={sub.mutate}
                manage={manage.mutate}
                session={session}
              />
            ))}
          <hr className="my-2 border-white/20" />
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
  onClick?: () => any;
  className?: string;
  small?: boolean;
}

const DrawerItem = (props: DrawerItemProps) => {
  const { icon, text, border, href, target, onClick, className } = props;
  const { t } = useTranslation();

  if (href) {
    return (
      <a
        className={clsx(
          "flex cursor-pointer flex-row items-center rounded-md p-2 hover:bg-white/5",
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
          "flex cursor-pointer flex-row items-center rounded-md p-2 hover:bg-white/5",
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
  const text = session?.user ? "sign-out" : "sign-in";
  const onClick = session?.user ? signOut : signIn;

  return <DrawerItem icon={icon} text={text} onClick={onClick} />;
};

const ProItem: React.FC<{
  session: Session | null;
  sub: () => any;
  manage: () => any;
}> = ({ sub, manage, session }) => {
  const text = session?.user?.subscriptionId ? "Account" : "Go Pro";
  let icon = session?.user ? <FaUser /> : <FaRocket />;
  if (session?.user?.image) {
    icon = (
      <img
        src={session?.user.image}
        className="h-6 w-6 rounded-full"
        alt="User Image"
      />
    );
  }

  return (
    <DrawerItem
      icon={icon}
      text={text}
      onClick={async () => {
        if (!session?.user) {
          void (await signIn());
        }

        if (session?.user.subscriptionId) {
          void manage();
        } else {
          void sub();
        }
      }}
    />
  );
};

export default Drawer;

import React, { useEffect } from "react";
import { useTranslation, Trans } from "next-i18next";
import Button from "./Button";
import {
  FaKey,
  FaMicrochip,
  FaThermometerFull,
  FaExclamationCircle,
  FaSyncAlt,
  FaCoins,
  FaCode,
  FaServer,
} from "react-icons/fa";
import Dialog from "./Dialog";
import Input from "./Input";
import { GPT_MODEL_NAMES, GPT_4 } from "../utils/constants";
import Accordion from "./Accordion";
import type { ModelSettings, SettingModel } from "../utils/types";
import { useGuestMode } from "../hooks/useGuestMode";
import clsx from "clsx";

export const SettingsDialog: React.FC<{
  show: boolean;
  close: () => void;
  customSettings: SettingModel;
}> = ({ show, close, customSettings }) => {
  const [settings, setSettings] = React.useState<ModelSettings>({
    ...customSettings.settings,
  });
  const { isGuestMode } = useGuestMode(settings.customGuestKey);
  const { t } = useTranslation(["settings", "common"]);

  useEffect(() => {
    setSettings(customSettings.settings);
  }, [customSettings, close]);

  const updateSettings = <Key extends keyof ModelSettings>(
    key: Key,
    value: ModelSettings[Key]
  ) => {
    setSettings((prev) => {
      return { ...prev, [key]: value };
    });
  };

  const keyIsValid = (key: string | undefined) => {
    const pattern = /^(sk-[a-zA-Z0-9]{48}|[a-fA-F0-9]{32})$/;
    return key && pattern.test(key);
  };

  const urlIsValid = (url: string | undefined) => {
    if (url) {
      const pattern = /^(https?:\/\/)?[\w.-]+\.[a-zA-Z]{2,}(\/\S*)?$/;
      return pattern.test(url);
    }
    return true;
  };

  const handleSave = () => {
    if (!isGuestMode && !keyIsValid(settings.customApiKey)) {
      alert(
        t(
          "Key is invalid, please ensure that you have set up billing in your OpenAI account!"
        )
      );
      return;
    }

    if (!urlIsValid(settings.customEndPoint)) {
      alert(
        t(
          "Endpoint URL is invalid. Please ensure that you have set a correct URL."
        )
      );
      return;
    }
    customSettings.saveSettings(settings);
    close();
    return;
  };

  const handleReset = () => {
    customSettings.resetSettings();
    close();
  };

  const disabled = !isGuestMode && !settings.customApiKey;
  const advancedSettings = (
    <div className="flex flex-col gap-2">
      <Input
        left={
          <>
            <FaServer />
            <span className="ml-2">{t("endPoint")}</span>
          </>
        }
        disabled={disabled}
        value={settings.customEndPoint}
        onChange={(e) => updateSettings("customEndPoint", e.target.value)}
      />
      <Input
        left={
          <>
            <FaThermometerFull />
            <span className="ml-2">{t("temp")}</span>
          </>
        }
        value={settings.customTemperature}
        onChange={(e) =>
          updateSettings("customTemperature", parseFloat(e.target.value))
        }
        type="range"
        toolTipProperties={{
          message: t("temp-tips") as string,
          disabled: false,
        }}
        attributes={{
          min: 0,
          max: 1,
          step: 0.01,
        }}
      />
      <Input
        left={
          <>
            <FaSyncAlt />
            <span className="ml-2">{t("loop")}</span>
          </>
        }
        value={settings.customMaxLoops}
        disabled={disabled}
        onChange={(e) =>
          updateSettings("customMaxLoops", parseFloat(e.target.value))
        }
        type="range"
        toolTipProperties={{
          message: t("loop-tips") as string,
          disabled: false,
        }}
        attributes={{
          min: 1,
          max: 100,
          step: 1,
        }}
      />
      <Input
        left={
          <>
            <FaCoins />
            <span className="ml-2">{t("tokens")}</span>
          </>
        }
        value={settings.customMaxTokens ?? 400}
        disabled={disabled}
        onChange={(e) =>
          updateSettings("customMaxTokens", parseFloat(e.target.value))
        }
        type="range"
        toolTipProperties={{
          message: t("tokens-tips") as string,
          disabled: false,
        }}
        attributes={{
          min: 200,
          max: 2000,
          step: 100,
        }}
      />
    </div>
  );

  return (
    <Dialog
      header={`${t("settings")} ⚙`}
      isShown={show}
      close={close}
      footerButton={
        <>
          <Button className="bg-red-400 hover:bg-red-500" onClick={handleReset}>
            {t("common:reset")}
          </Button>
          <Button onClick={handleSave}>{t("common:save")}</Button>
        </>
      }
    >
      <p>{t("usage")}</p>
      <p
        className={clsx(
          "my-2",
          settings.customModelName === GPT_4 &&
            "rounded-md border-[2px] border-white/10 bg-yellow-300 text-black"
        )}
      >
        <FaExclamationCircle className="inline-block" />
        &nbsp;
        <Trans i18nKey="gpt4-notice" ns="settings">
          <b>
            To use the GPT-4 model, you need to also provide the API key for
            GPT-4. You can request for it&nbsp;
            <a
              href="https://openai.com/waitlist/gpt-4-api"
              className="text-blue-500"
            >
              here
            </a>
            . (ChatGPT Plus subscription will not work)
          </b>
        </Trans>
      </p>
      <div className="mt-2 flex flex-col gap-2">
        <Input
          left={
            <>
              <FaKey />
              <span className="ml-2">{t("key")}</span>
            </>
          }
          placeholder={"sk-..."}
          value={settings.customApiKey}
          onChange={(e) => updateSettings("customApiKey", e.target.value)}
          type="password"
        />
        <Input
          left={
            <>
              <FaMicrochip />
              <span className="ml-2">{t("model")}</span>
            </>
          }
          type="combobox"
          value={settings.customModelName}
          onChange={() => null}
          setValue={(e) => updateSettings("customModelName", e)}
          attributes={{ options: GPT_MODEL_NAMES }}
          disabled={disabled}
        />
        {isGuestMode && (
          <Input
            left={
              <>
                <FaCode />
                <span className="ml-2">{t("guest-key")}</span>
              </>
            }
            value={settings.customGuestKey}
            onChange={(e) => updateSettings("customGuestKey", e.target.value)}
            type="password"
          />
        )}
        <Accordion
          child={advancedSettings}
          name={t("advanced-settings")}
        ></Accordion>
      </div>
      <Trans i18nKey="api-key-notice" ns="settings">
        <strong className="mt-10">
          NOTE: To get a key, sign up for an OpenAI account and visit the
          following
          <a
            href="https://platform.openai.com/account/api-keys"
            className="text-blue-500"
          >
            link.
          </a>
          This key is only used in the current browser session
        </strong>
      </Trans>
    </Dialog>
  );
};

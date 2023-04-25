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
} from "react-icons/fa";
import Dialog from "./Dialog";
import Input from "./Input";
import { GPT_MODEL_NAMES, GPT_4 } from "../utils/constants";
import Accordion from "./Accordion";
import type { ModelSettings } from "../utils/types";
import { useGuestMode } from "../hooks/useGuestMode";

export const SettingsDialog: React.FC<{
  show: boolean;
  close: () => void;
  customSettings: [ModelSettings, (settings: ModelSettings) => void];
}> = ({ show, close, customSettings: [customSettings, setCustomSettings] }) => {
  const [settings, setSettings] = React.useState<ModelSettings>({
    ...customSettings,
  });
  const { isGuestMode } = useGuestMode(settings.guestKey);
  const { t } = useTranslation(["settings", "common"]);

  useEffect(() => {
    setSettings(customSettings);
  }, [customSettings, close]);

  const updateSettings = <Key extends keyof ModelSettings>(
    key: Key,
    value: ModelSettings[Key]
  ) => {
    setSettings((prev) => {
      return { ...prev, [key]: value };
    });
  };

  const handleSave = () => {
    setCustomSettings(settings);
    close();
    return;
  };

  const disabled = !settings.customApiKey;
  const advancedSettings = (
    <>
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
      <br />
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
      <br />
      <Input
        left={
          <>
            <FaCoins />
            <span className="ml-2">{t("tokens")}</span>
          </>
        }
        value={settings.maxTokens ?? 400}
        disabled={disabled}
        onChange={(e) =>
          updateSettings("maxTokens", parseFloat(e.target.value))
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
    </>
  );

  return (
    <Dialog
      header={`${t("settings")} ⚙`}
      isShown={show}
      close={close}
      footerButton={<Button onClick={handleSave}>{t("common:save")}</Button>}
    >
      <p>{t("usage")}</p>
      <br />
      <p
        className={
          settings.customModelName === GPT_4
            ? "rounded-md border-[2px] border-white/10 bg-yellow-300 text-black"
            : ""
        }
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
      <br />
      <div className="text-md relative flex-auto p-2 leading-relaxed">
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
        />
        <br className="md:inline" />
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
        <br className="md:inline" />
        {isGuestMode && (
          <Input
            left={
              <>
                <FaCode />
                <span className="ml-2">{t("guest-key")}</span>
              </>
            }
            value={settings.guestKey}
            onChange={(e) => updateSettings("guestKey", e.target.value)}
          />
        )}
        <br className="hidden md:inline" />
        <Accordion
          child={advancedSettings}
          name={t("advanced-settings")}
        ></Accordion>
        <br />
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
      </div>
    </Dialog>
  );
};

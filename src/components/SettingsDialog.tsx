import React from "react";
import Button from "./Button";
import {
  FaKey,
  FaMicrochip,
  FaThermometerFull,
  FaExclamationCircle,
  FaSyncAlt,
} from "react-icons/fa";
import Dialog from "./Dialog";
import Input from "./Input";
import {
  GPT_MODEL_NAMES,
  GPT_4,
  DEFAULT_MAX_LOOPS_CUSTOM_API_KEY,
  DEFAULT_MAX_LOOPS_FREE,
} from "../utils/constants";
import Accordion from "./Accordion";
import type { reactModelStates } from "./types";
import { useTranslation, Trans } from "next-i18next";

export default function SettingsDialog({
  show,
  close,
  reactModelStates,
}: {
  show: boolean;
  close: () => void;
  reactModelStates: reactModelStates;
}) {
  const {
    customApiKey,
    setCustomApiKey,
    customModelName,
    setCustomModelName,
    customTemperature,
    setCustomTemperature,
    customMaxLoops,
    setCustomMaxLoops,
  } = reactModelStates;
  const { t } = useTranslation(["settings", "common"]);

  const [key, setKey] = React.useState<string>(customApiKey);

  const handleClose = () => {
    setKey(customApiKey);
    close();
  };

  function is_valid_key(key: string) {
    const pattern = /^sk-[a-zA-Z0-9]{48}$/;
    return pattern.test(key);
  }

  const handleSave = () => {
    if (is_valid_key(key)) {
      setCustomApiKey(key);
      close();
    } else {
      alert(t("invalid-key"));
    }
  };

  React.useEffect(() => {
    setCustomMaxLoops(
      !key ? DEFAULT_MAX_LOOPS_FREE : DEFAULT_MAX_LOOPS_CUSTOM_API_KEY
    );

    return () => {
      setCustomMaxLoops(DEFAULT_MAX_LOOPS_FREE);
    };
  }, [key, setCustomMaxLoops]);

  const advancedSettings = (
    <>
      <Input
        left={
          <>
            <FaThermometerFull />
            <span className="ml-2">{t("temp")}</span>
          </>
        }
        value={customTemperature}
        onChange={(e) => setCustomTemperature(parseFloat(e.target.value))}
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
        value={customMaxLoops}
        disabled={!key}
        onChange={(e) => setCustomMaxLoops(parseFloat(e.target.value))}
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
    </>
  );

  return (
    <Dialog
      header={`${t("settings")} ⚙`}
      isShown={show}
      close={handleClose}
      footerButton={<Button onClick={handleSave}>{t("common:save")}</Button>}
    >
      <p>{t("usage")}</p>
      <br />
      <p
        className={
          customModelName === GPT_4
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
              <FaMicrochip />
              <span className="ml-2">{t("model")}</span>
            </>
          }
          type="combobox"
          value={customModelName}
          onChange={() => null}
          setValue={setCustomModelName}
          attributes={{ options: GPT_MODEL_NAMES }}
        />
        <br className="hidden md:inline" />
        <Input
          left={
            <>
              <FaKey />
              <span className="ml-2">{t("key")} </span>
            </>
          }
          placeholder={"sk-..."}
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <br className="md:inline" />
        <Accordion
          child={advancedSettings}
          name={t("advanceds-ettings")}
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
}

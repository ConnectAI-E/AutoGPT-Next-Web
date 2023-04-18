import React from "react";
import Button from "./Button";
import { FaKey, FaMicrochip } from "react-icons/fa";
import Dialog from "./Dialog";
import Input from "./Input";
import { GPT_MODEL_NAMES } from "../utils/constants";
import { useTranslation, Trans } from "next-i18next";

export default function SettingsDialog({
  show,
  close,
  customApiKey,
  setCustomApiKey,
  customModelName,
  setCustomModelName,
}: {
  show: boolean;
  close: () => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
  customModelName: string;
  setCustomModelName: (key: string) => void;
}) {
  const [key, setKey] = React.useState<string>(customApiKey);
  const { t } = useTranslation(["settings", "common"]);
  const handleClose = () => {
    setKey(customApiKey);
    close();
  };

  const handleSave = () => {
    setCustomApiKey(key);
    close();
  };

  return (
    <Dialog
      header={`${t("settings")} ⚙`}
      isShown={show}
      close={handleClose}
      footerButton={<Button onClick={handleSave}>{t("common:save")}</Button>}
    >
      <p>{t("usage")}</p>
      <br />
      <p>{t("notice-access")}</p>
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
          onChange={(e) => null}
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
        <br className="hidden md:inline" />
        <Trans i18nKey="note-with-link" ns="settings">
          <strong>
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

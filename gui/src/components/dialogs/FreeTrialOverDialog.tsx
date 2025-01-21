import { useDispatch } from "react-redux";
import styled from "styled-components";
import { Button, SecondaryButton } from "..";
import { setDialogMessage, setShowDialog } from "../../redux/slices/uiSlice";
import { useAppSelector } from "../../redux/hooks";
import { useEffect } from "react";

interface FreeTrialOverDialogProps {
  onConfirm: () => void;
  onCancel?: () => void;
  text: string;
  title?: string;
  hideCancelButton?: boolean;
  confirmText?: string;
}

function FreeTrialOverDialog(props: FreeTrialOverDialogProps) {
  const dispatch = useDispatch();
  const history = useAppSelector((store) => store.session.history);

  useEffect(() => {
    if (history.length === 0) {
      dispatch(setShowDialog(false));
      dispatch(setDialogMessage(undefined));
    }
  }, [history]);

  return (
    <div className="p-4 pt-0">
      <h1 className="mb-1 text-center text-xl">
        {props.title ?? "Confirmation"}
      </h1>
      <p className="text-center text-base" style={{ whiteSpace: "pre-wrap" }}>
        {props.text}
      </p>

      <div className="w/1/2 flex justify-end gap-2">
        {!!props.hideCancelButton || (
          <SecondaryButton
            className="text-lightgray"
            onClick={() => {
              dispatch(setShowDialog(false));
              dispatch(setDialogMessage(undefined));
              props.onCancel?.();
            }}
          >
            Cancel
          </SecondaryButton>
        )}
        <Button
          onClick={() => {
            props.onConfirm();
            dispatch(setShowDialog(false));
            dispatch(setDialogMessage(undefined));
          }}
        >
          {props.confirmText ?? "Confirm"}
        </Button>
      </div>
    </div>
  );
}

export default FreeTrialOverDialog;

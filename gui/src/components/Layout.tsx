import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { CustomScrollbarDiv, defaultBorderRadius, vscInputBackground } from ".";
import { IdeMessengerContext } from "../context/IdeMessenger";
import { useWebviewListener } from "../hooks/useWebviewListener";
import { defaultModelSelector } from "../redux/selectors/modelSelectors";
import { setShowDialog, updateApplyState } from "../redux/slices/uiStateSlice";
import { RootState } from "../redux/store";
import { getFontSize, isMetaEquivalentKeyPressed } from "../util";
import { getLocalStorage, setLocalStorage } from "../util/localStorage";
import ButtonWithTooltip from "./ButtonWithTooltip";
import TextDialog from "./dialogs";
import ProgressBar from "./loaders/ProgressBar";
import { useOnboardingCard } from "./OnboardingCard";
import { isNewUserOnboarding } from "./OnboardingCard/utils";
import PostHogPageView from "./PosthogPageView";
import ProfileSwitcher from "./ProfileSwitcher";
import { isNewUserOnboarding } from "./OnboardingCard/utils";
import { useOnboardingCard } from "./OnboardingCard";
import {
  setBottomMessage,
  setBottomMessageCloseTimeout,
  setShowDialog,
} from "../redux/slices/uiStateSlice";
import ButtonWithTooltip from "./ButtonWithTooltip";

const FOOTER_HEIGHT = "1.8em";

const LayoutTopDiv = styled(CustomScrollbarDiv)`
  height: 100%;
  border-radius: ${defaultBorderRadius};
  position: relative;
  overflow-x: hidden;

  &::after {
    position: absolute;
    content: "";
    width: 100%;
    height: 1px;
    background-color: rgba(136, 136, 136, 0.3);
    top: 0;
    left: 0;
  }
`;

const Footer = styled.footer`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: right;
  padding: 8px;
  align-items: center;
  width: calc(100% - 16px);
  height: ${FOOTER_HEIGHT};
  background-color: transparent;
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(136, 136, 136, 0.3);
  border-bottom: 1px solid rgba(136, 136, 136, 0.3);
  overflow: hidden;
`;

const GridDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr auto;
  height: 100vh;
  overflow-x: visible;
`;

const ModelDropdownPortalDiv = styled.div`
  background-color: ${vscInputBackground};
  position: relative;
  margin-left: 8px;
  z-index: 200;
  font-size: ${getFontSize()};
`;

const ProfileDropdownPortalDiv = styled.div`
  background-color: ${vscInputBackground};
  position: relative;
  margin-left: 8px;
  z-index: 200;
  font-size: ${getFontSize() - 2};
`;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const ideMessenger = useContext(IdeMessengerContext);
  const onboardingCard = useOnboardingCard();

  const dialogMessage = useSelector(
    (state: RootState) => state.uiState.dialogMessage,
  );
  const showDialog = useSelector(
    (state: RootState) => state.uiState.showDialog,
  );

  const defaultModel = useSelector(defaultModelSelector);

  const timeline = useSelector((state: RootState) => state.state.history);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (isMetaEquivalentKeyPressed(event) && event.code === "KeyC") {
        const selection = window.getSelection()?.toString();
        if (selection) {
          // Copy to clipboard
          setTimeout(() => {
            navigator.clipboard.writeText(selection);
          }, 100);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [timeline]);

  useWebviewListener(
    "addModel",
    async () => {
      navigate("/models");
    },
    [navigate],
  );

  useWebviewListener("openSettings", async () => {
    ideMessenger.post("openConfigJson", undefined);
  });

  useWebviewListener(
    "viewHistory",
    async () => {
      // Toggle the history page / main page
      if (location.pathname === "/history") {
        navigate("/");
      } else {
        navigate("/history");
      }
    },
    [location, navigate],
  );

  useWebviewListener(
    "incrementFtc",
    async () => {
      const u = getLocalStorage("ftc");
      if (u) {
        setLocalStorage("ftc", u + 1);
      } else {
        setLocalStorage("ftc", 1);
      }
    },
    [],
  );

  useWebviewListener(
    "updateApplyState",
    async (state) => {
      dispatch(updateApplyState(state));
    },
    [],
  );

  useWebviewListener(
    "openOnboardingCard",
    async () => {
      onboardingCard.open("Best");
    },
    [],
  );

  useWebviewListener(
    "setupLocalConfig",
    async () => {
      onboardingCard.open("Local");
    },
    [],
  );

  useEffect(() => {
    if (
      isNewUserOnboarding() &&
      (location.pathname === "/" || location.pathname === "/index.html")
    ) {
      onboardingCard.open("Quickstart");
    }
  }, [location]);

  return (
    <LayoutTopDiv>
      <div
        style={{
          scrollbarGutter: "stable both-edges",
          minHeight: "100%",
          display: "grid",
          gridTemplateRows: "1fr auto",
        }}
      >
        <TextDialog
          showDialog={showDialog}
          onEnter={() => {
            dispatch(setShowDialog(false));
          }}
          onClose={() => {
            dispatch(setShowDialog(false));
          }}
          message={dialogMessage}
        />

        <GridDiv>
          <PostHogPageView />
          <Outlet />
          <ModelDropdownPortalDiv id="model-select-top-div"></ModelDropdownPortalDiv>
          <ProfileDropdownPortalDiv id="profile-select-top-div"></ProfileDropdownPortalDiv>
          <Footer />
        </GridDiv>
      </div>
      <div
        style={{ fontSize: `${getFontSize() - 4}px` }}
        id="tooltip-portal-div"
      />
    </LayoutTopDiv>
  );
};

export default Layout;

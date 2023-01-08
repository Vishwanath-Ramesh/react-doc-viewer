import React, { FC, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { setRendererRect } from "../store/actions";
import { IStyledProps } from "../models";
import { getFileName } from "../utils/getFileName";
import { useDocumentLoader } from "../hooks/useDocumentLoader";
import { useWindowSize } from "../hooks/useWindowSize";
import { LinkButton } from "./common";
import { LoadingIcon } from "./icons";
import { LoadingTimeout } from "./LoadingTimout";
import { useTranslation } from "../hooks/useTranslation";

export const ProxyRenderer: FC<{}> = () => {
  const { state, dispatch, CurrentRenderer } = useDocumentLoader();
  const { documents, documentLoading, currentDocument, config } = state;
  const size = useWindowSize();
  const { t } = useTranslation();

  const containerRef = useCallback(
    (node: HTMLDivElement) => {
      node && dispatch(setRendererRect(node?.getBoundingClientRect()));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size]
  );

  const fileName = getFileName(
    currentDocument,
    config?.header?.retainURLParams || false
  );

  const Contents = () => {
    if (!documents.length) {
      return <div id="no-documents"></div>;
    } else if (documentLoading) {
      if (config && config?.loadingRenderer?.overrideComponent) {
        const OverrideComponent = config.loadingRenderer.overrideComponent;
        return (
          <LoadingTimeout>
            <OverrideComponent document={currentDocument} fileName={fileName} />
          </LoadingTimeout>
        );
      }

      return (
        <LoadingTimeout>
          <LoadingContainer
            id="loading-renderer"
            data-testid="loading-renderer"
          >
            <LoadingIconContainer>
              <LoadingIcon color="#444" size={40} />
            </LoadingIconContainer>
          </LoadingContainer>
        </LoadingTimeout>
      );
    } else {
      if (CurrentRenderer) {
        return <CurrentRenderer mainState={state} />;
      } else if (CurrentRenderer === undefined) {
        return null;
      } else {
        if (config && config?.noRenderer?.overrideComponent) {
          const OverrideComponent = config.noRenderer.overrideComponent;
          return (
            <OverrideComponent document={currentDocument} fileName={fileName} />
          );
        }

        return (
          <div id="no-renderer" data-testid="no-renderer">
            {t("noRendererMessage", {
              fileType: currentDocument?.fileType ?? "",
            })}
            <DownloadButton
              id="no-renderer-download"
              href={currentDocument?.fileSource?.uri}
              download={currentDocument?.fileSource?.uri}
            >
              {t("downloadButtonLabel")}
            </DownloadButton>
          </div>
        );
      }
    }
  };

  return (
    <Container
      id="proxy-renderer"
      data-testid="proxy-renderer"
      ref={containerRef}
    >
      <Contents />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex: 1;
  overflow-y: auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex: 1;
  height: 75px;
  align-items: center;
  justify-content: center;
`;

const spinAnim = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingIconContainer = styled.div`
  animation-name: ${spinAnim};
  animation-duration: 4s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
`;

const DownloadButton = styled(LinkButton)`
  width: 130px;
  height: 30px;
  background-color: ${(props: IStyledProps) => props.theme.primary};
  @media (max-width: 768px) {
    width: 125px;
    height: 25px;
  }
`;

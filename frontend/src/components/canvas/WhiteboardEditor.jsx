import React, { useRef } from 'react';
import { TopToolbar } from './TopToolbar';
import { CanvasStage } from './CanvasStage';
import { FloatingPenTray } from './FloatingPenTray';
import { BottomColorBar } from './BottomColorBar';
import { CanvasSettingsPopover } from './CanvasSettingsPopover';
import { FormulaModal } from './FormulaModal';
import { AudioMemoRecorder } from './AudioMemoRecorder';
import { ShareCollabModal } from './ShareCollabModal';

export const WhiteboardEditor = () => {
  const stageRef = useRef(null);

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#0b0d14] overflow-hidden select-none">
      {/* Top Action Toolbar */}
      <TopToolbar stageRef={stageRef} />

      {/* Main Infinite Canvas Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <CanvasStage stageRef={stageRef} />

        {/* Floating Apple Notes / Goodnotes Pen Tray (Wireframe 3) */}
        <FloatingPenTray />

        {/* Floating Bottom Color & Opacity Palette */}
        <BottomColorBar />

        {/* Background Paper & Grid Settings Popover (Wireframe 4) */}
        <CanvasSettingsPopover />
      </div>

      {/* LaTeX Math Formula Modal */}
      <FormulaModal />

      {/* Voice Audio Memo Recording Tool */}
      <AudioMemoRecorder />

      {/* Live Collaboration Share Modal */}
      <ShareCollabModal />
    </div>
  );
};

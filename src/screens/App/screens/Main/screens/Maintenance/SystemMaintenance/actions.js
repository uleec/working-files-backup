
export function changeShowProgessBar(data) {
  return {
    type: 'CHANGE_SHOW_PROGESS_BAR',
    data,
  };
}

export function changeProgressBarInfo(data) {
  return {
    type: 'CHANGE_PROGRESS_BAR_INFO',
    data,
  };
}

export function restoreSelfState() {
  return {
    type: 'RESTORE_SELF_STATE',
  };
}



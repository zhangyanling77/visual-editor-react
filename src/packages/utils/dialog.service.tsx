import React, { useState } from 'react';
import deepcopy from 'deepcopy';
import { Modal, Button, Input } from 'antd';
import ReactDOM from 'react-dom';
import { defer } from './defer';

export enum DialogServiceEdit {
  input = 'input',
  textarea = 'textarea',
}

interface DialogServiceOption {
  title?: string;
  message?: string | (() => any);
  confirmButton?: boolean;
  cancelButton?: boolean;
  onConfirm?: (editValue?: string) => void;
  onCancel?: () => void;
  editType?: DialogServiceEdit;
  editValue?: string;
  editReadonly?: boolean;
  width?: string;
}

interface DialogServiceInstance {
  show: (option?: DialogServiceOption) => void;
  close: () => void;
}

const Component: React.FC<{
  option?: DialogServiceOption;
  onRef?: (ins: DialogServiceInstance) => void;
}> = (props) => {
  const [option, setOption] = useState(props.option || {});
  const [visible, setVisible] = useState(false);
  const [editValue, setEditValue] = useState(option ? option.editValue : '');

  const methods = {
    show: (option?: DialogServiceOption) => {
      setOption(deepcopy(option || {}));
      setEditValue(!option ? '' : option.editValue || '');
      setVisible(true);
    },
    close: () => setVisible(false),
  };

  !!props.onRef && props.onRef(methods);

  const handler = {
    onConfirm: () => {
      !!option.onConfirm && option.onConfirm(editValue);
      methods.close();
    },
    onCancel: () => {
      !!option.onCancel && option.onCancel();
      methods.close();
    },
  };

  const inputProps = {
    value: editValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setEditValue(e.target.value),
    readOnly: option.editReadonly === true,
  };

  return (
    <Modal
      maskClosable
      closable
      title={option.title || '系统提示'}
      visible={visible}
      onCancel={handler.onCancel}
      footer={
        option.confirmButton || option.cancelButton ? (
          <>
            {option.cancelButton && (
              <Button onClick={handler.onCancel}>取消</Button>
            )}
            {option.confirmButton && (
              <Button type="primary" onClick={handler.onConfirm}>
                确定
              </Button>
            )}
          </>
        ) : null
      }
    >
      {option.message}
      {option.editType === DialogServiceEdit.input && <Input {...inputProps} />}
      {option.editType === DialogServiceEdit.textarea && (
        <Input.TextArea {...inputProps} rows={15} />
      )}
    </Modal>
  );
};

const getInstance = (() => {
  let ins: null | DialogServiceInstance = null;
  return (option?: DialogServiceOption) => {
    if (!ins) {
      const el = document.createElement('div');
      document.body.appendChild(el);
      ReactDOM.render(
        <Component option={option} onRef={(val) => (ins = val)} />,
        el,
      );
    }
    return ins!;
  };
})();

const DialogService = (option?: DialogServiceOption) => {
  const ins = getInstance(option);
  ins.show(option);
};

export const $$dialog = Object.assign(DialogService, {
  textarea: (val?: string, option?: DialogServiceOption) => {
    const dfd = defer<string | undefined>();
    option = option || {};
    option.editType = DialogServiceEdit.textarea;
    option.editValue = val;
    if (option.editReadonly !== true) {
      option.confirmButton = true;
      option.cancelButton = true;
      option.onConfirm = dfd.resolve;
    }
    DialogService(option);
    return dfd.promise;
  },
  input: (val?: string, option?: DialogServiceOption) => {
    const dfd = defer<string | undefined>();
    option = option || {};
    option.editType = DialogServiceEdit.input;
    option.editValue = val;
    if (option.editReadonly !== true) {
      option.confirmButton = true;
      option.cancelButton = true;
      option.onConfirm = dfd.resolve;
    }
    DialogService(option);
    return dfd.promise;
  },
});

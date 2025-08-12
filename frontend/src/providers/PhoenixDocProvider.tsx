import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState
} from 'react';

interface CollapseContextInterface {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  showPreviewBtn: boolean;
  setShowPreviewBtn: Dispatch<SetStateAction<boolean>>;
  textToCopy: string;
  setTextToCopy: Dispatch<SetStateAction<string>>;
}

export const CollapseContext = createContext({} as CollapseContextInterface);

const PhoenixDocProvider = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false);
  const [showPreviewBtn, setShowPreviewBtn] = useState(true);
  const [textToCopy, setTextToCopy] = useState('');

  return (
    <CollapseContext.Provider
      value={{
        open,
        setOpen,
        showPreviewBtn,
        setShowPreviewBtn,
        textToCopy,
        setTextToCopy
      }}
    >
      {children}
    </CollapseContext.Provider>
  );
};

export const usePhoenixDocContext = () => useContext(CollapseContext);

export default PhoenixDocProvider;

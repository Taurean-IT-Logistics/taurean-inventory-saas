import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState
} from 'react';

interface ScrollSpyContextInterface {
  activeElemId: string;
  setActiveElemId: Dispatch<SetStateAction<string>>;
  visibleItems: string[];
  setVisibleItems: Dispatch<SetStateAction<string[]>>;
}

export const ScrollSpyContext = createContext({} as ScrollSpyContextInterface);

const ScrollSpyProvider = ({ children }: PropsWithChildren) => {
  const [activeElemId, setActiveElemId] = useState('');
  const [visibleItems, setVisibleItems] = useState<string[]>([]);

  return (
    <ScrollSpyContext.Provider
      value={{ activeElemId, setActiveElemId, visibleItems, setVisibleItems }}
    >
      {children}
    </ScrollSpyContext.Provider>
  );
};

export const useScrollSpyContext = () => useContext(ScrollSpyContext);

export default ScrollSpyProvider;

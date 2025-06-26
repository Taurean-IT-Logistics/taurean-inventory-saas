import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState
} from 'react';

interface NavbarVerticalCollapseContextInterface {
  openItems: string[];
  setOpenItems: Dispatch<SetStateAction<string[]>>;
}

const NavbarVerticalCollapseContext = createContext(
  {} as NavbarVerticalCollapseContextInterface
);

const NavbarVerticalCollapseProvider = ({ children }: PropsWithChildren) => {
  const [openItems, setOpenItems] = useState(['']);
  return (
    <NavbarVerticalCollapseContext.Provider value={{ openItems, setOpenItems }}>
      {children}
    </NavbarVerticalCollapseContext.Provider>
  );
};

export const useNavbarVerticalCollapse = () =>
  useContext(NavbarVerticalCollapseContext);

export default NavbarVerticalCollapseProvider;

import { File, fileCollection as filesData } from 'data/file-manager';
import {
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  PropsWithChildren,
  useContext,
  useEffect
} from 'react';
import { gridBreakpoints } from './BreakpointsProvider';
interface FileManagerContextInterface {
  fileCollection: File[];
  setFileCollection: Dispatch<SetStateAction<File[]>>;
  showFileDetails: boolean;
  setShowFileDetails: Dispatch<SetStateAction<boolean>>;
  checkedFileIds: number[];
  setCheckedFileIds: Dispatch<SetStateAction<number[]>>;
  isGridView: boolean;
  setIsGridView: Dispatch<SetStateAction<boolean>>;
  isGrouped: boolean;
  setIsGrouped: Dispatch<SetStateAction<boolean>>;
}

export const FileManagerContext = createContext(
  {} as FileManagerContextInterface
);

const FileManagerProvider = ({ children }: PropsWithChildren) => {
  const [fileCollection, setFileCollection] = useState<File[]>([]);
  const [showFileDetails, setShowFileDetails] = useState(
    window.innerWidth >= gridBreakpoints.xxl
  );
  const [checkedFileIds, setCheckedFileIds] = useState<number[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const [isGrouped, setIsGrouped] = useState(false);

  useEffect(() => {
    setFileCollection(filesData);
  }, []);

  return (
    <FileManagerContext.Provider
      value={{
        fileCollection,
        setFileCollection,
        showFileDetails,
        setShowFileDetails,
        checkedFileIds,
        setCheckedFileIds,
        isGridView,
        setIsGridView,
        isGrouped,
        setIsGrouped
      }}
    >
      {children}
    </FileManagerContext.Provider>
  );
};

export const useFileManagerContext = () => useContext(FileManagerContext);

export default FileManagerProvider;

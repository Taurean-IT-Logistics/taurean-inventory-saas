import { DealColumn, Deal } from 'data/crm/deals';
import {
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  PropsWithChildren,
  useContext,
  useCallback
} from 'react';
import { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface DealsContextInterface {
  dealColumns: DealColumn[];
  setDealColumns: Dispatch<SetStateAction<DealColumn[]>>;
  openAddDealModal: boolean;
  setOpenAddDealModal: Dispatch<SetStateAction<boolean>>;
  openFilterDealModal: boolean;
  setOpenFilterDealModal: Dispatch<SetStateAction<boolean>>;
  openAddStageModal: boolean;
  setOpenAddStageModal: Dispatch<SetStateAction<boolean>>;
  activeDeal: Deal | null;
  activeColumnId: number | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (result: DragEndEvent) => void;
  handleAddStage: (formData: DealColumn) => void;
}

export const DealsContext = createContext({} as DealsContextInterface);

const DealsProvider = ({
  children,
  data
}: PropsWithChildren<{ data: DealColumn[] }>) => {
  const [dealColumns, setDealColumns] = useState(data);
  const [openAddDealModal, setOpenAddDealModal] = useState(false);
  const [openFilterDealModal, setOpenFilterDealModal] = useState(false);
  const [openAddStageModal, setOpenAddStageModal] = useState(false);
  const [activeDeal, setActiveDeal] = useState(null);
  const [activeColumnId, setActiveColumnId] = useState(null);

  const findColumn = (id: number) => {
    return dealColumns.find(
      col => col.deals.some(deal => deal.id === id) || col.id === id
    );
  };

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setActiveDeal(active.data.current?.item);
      setActiveColumnId(active.data.current?.columnId);
    },
    [dealColumns]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;

      if (!active.id || !over?.id) return;

      const activeId = Number(active.id);
      const overId = Number(over.id);

      const activeColumn = findColumn(activeId);
      const overColumn = findColumn(overId);

      if (!activeColumn || !overColumn || activeColumn.id === overColumn.id)
        return;

      const updatedColumns = structuredClone(dealColumns);
      const updatedActiveColumn = updatedColumns.find(
        col => col.id === activeColumn.id
      );
      const updatedOverColumn = updatedColumns.find(
        col => col.id === overColumn.id
      );

      if (updatedActiveColumn && updatedOverColumn) {
        const activeDealIndex = updatedActiveColumn.deals.findIndex(
          deal => deal.id === activeId
        );

        const movedDeal = updatedActiveColumn.deals.splice(
          activeDealIndex,
          1
        )[0];

        updatedOverColumn.deals.push(movedDeal);

        setDealColumns(updatedColumns);
      }
    },
    [dealColumns]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!active.id || !over?.id) return;

      const activeId = Number(active.id);
      const overId = Number(over.id);

      const activeColumn = findColumn(activeId);
      const overColumn = findColumn(overId);

      if (!activeColumn || !overColumn) return;

      const updatedColumns = structuredClone(dealColumns);
      const updatedActiveColumn = updatedColumns.find(
        col => col.id === activeColumn.id
      );
      const updatedOverColumn = updatedColumns.find(
        col => col.id === overColumn.id
      );

      if (updatedActiveColumn && updatedOverColumn) {
        if (activeColumn.id === overColumn.id) {
          const activeIndex = updatedActiveColumn.deals.findIndex(
            deal => deal.id === activeId
          );
          const overIndex = updatedOverColumn.deals.findIndex(
            deal => deal.id === overId
          );

          updatedActiveColumn.deals = arrayMove(
            updatedActiveColumn.deals,
            activeIndex,
            overIndex
          );
        } else {
          const activeDealIndex = updatedActiveColumn.deals.findIndex(
            deal => deal.id === activeId
          );
          const movedDeal = updatedActiveColumn.deals.splice(
            activeDealIndex,
            1
          )[0];

          const overIndex = updatedOverColumn.deals.findIndex(
            deal => deal.id === overId
          );

          updatedOverColumn.deals.splice(overIndex + 1, 0, movedDeal);
        }

        setDealColumns(updatedColumns);
        setActiveDeal(null);
        setActiveColumnId(null);
      }
    },
    [dealColumns]
  );

  const handleAddStage = useCallback(
    (formData: DealColumn) => {
      setDealColumns([...dealColumns, formData]);
    },
    [dealColumns]
  );
  return (
    <DealsContext.Provider
      value={{
        dealColumns,
        setDealColumns,
        openAddDealModal,
        setOpenAddDealModal,
        openFilterDealModal,
        setOpenFilterDealModal,
        openAddStageModal,
        setOpenAddStageModal,
        activeDeal,
        activeColumnId,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleAddStage
      }}
    >
      {children}
    </DealsContext.Provider>
  );
};

export const useDealsContext = () => useContext(DealsContext);

export default DealsProvider;

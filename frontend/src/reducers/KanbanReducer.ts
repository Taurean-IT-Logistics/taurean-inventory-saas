import { KanbanBoardItem, KanbanBoardTask } from 'data/kanban';
import { KanbanState } from 'providers/KanbanProvider';

//Action types
export const TOGGLE_DETAILS_OFFCANVAS = 'TOGGLE_DETAILS_OFFCANVAS';
export const TOGGLE_ADD_LIST_MODAL = 'TOGGLE_ADD_LIST_MODAL';
export const REMOVE_ITEM_FROM_LIST = 'REMOVE_ITEM_FROM_LIST';
export const UPDATE_SINGLE_COLUMN = 'UPDATE_SINGLE_COLUMN';
export const UPDATE_DUAL_COLUMN = 'UPDATE_DUAL_COLUMN';
export const ADD_NEW_LIST = 'ADD_NEW_LIST';
export const ADD_NEW_TASK = 'ADD_NEW_TASK';

//Action ts type
export type ACTIONTYPE =
  | {
      type: typeof TOGGLE_DETAILS_OFFCANVAS;
      payload?: boolean;
    }
  | {
      type: typeof TOGGLE_ADD_LIST_MODAL;
      payload?: boolean;
    }
  | {
      type: typeof REMOVE_ITEM_FROM_LIST;
      payload: { listId: number; itemIndex: number };
    }
  | {
      type: typeof UPDATE_SINGLE_COLUMN;
      payload: { column: KanbanBoardItem; reorderItems: KanbanBoardTask[] };
    }
  | {
      type: typeof UPDATE_DUAL_COLUMN;
      payload: {
        sourceColumn: KanbanBoardItem;
        updatedSourceItems: KanbanBoardTask[];
        destColumn: KanbanBoardItem;
        updatedDestItems: KanbanBoardTask[];
      };
    }
  | {
      type: typeof ADD_NEW_LIST;
      payload: { list: KanbanBoardItem; columnNo: number };
    }
  | {
      type: typeof ADD_NEW_TASK;
      payload: { newTask: KanbanBoardTask; columnId: number };
    };

// Reducer function
export const kanbanReducer = (state: KanbanState, action: ACTIONTYPE) => {
  switch (action.type) {
    case TOGGLE_DETAILS_OFFCANVAS: {
      const { payload } = action;
      return {
        ...state,
        openBoardDetailsOffcanvas:
          payload !== undefined ? payload : !state.openBoardDetailsOffcanvas
      };
    }
    case TOGGLE_ADD_LIST_MODAL: {
      const { payload } = action;
      return {
        ...state,
        openAddListModal:
          payload !== undefined ? payload : !state.openBoardDetailsOffcanvas
      };
    }
    case REMOVE_ITEM_FROM_LIST: {
      const { payload } = action;
      return {
        ...state,
        boardLists: state.boardLists.map(list =>
          list.id === payload.listId
            ? {
                ...list,
                tasks: list.tasks.filter(
                  (task, index) => index !== payload.itemIndex
                )
              }
            : list
        )
      };
    }
    case UPDATE_SINGLE_COLUMN: {
      const {
        payload: { column, reorderItems }
      } = action;
      return {
        ...state,
        boardLists: state.boardLists.map(list =>
          list.id === column.id ? { ...list, tasks: reorderItems } : list
        )
      };
    }
    case UPDATE_DUAL_COLUMN: {
      const {
        payload: {
          sourceColumn,
          updatedSourceItems,
          destColumn,
          updatedDestItems
        }
      } = action;
      return {
        ...state,
        boardLists: state.boardLists.map(list => {
          if (list.id === sourceColumn.id) {
            return { ...list, tasks: updatedSourceItems };
          }
          if (list.id === destColumn.id) {
            return { ...list, tasks: updatedDestItems };
          }
          return list;
        })
      };
    }
    case ADD_NEW_TASK: {
      const {
        payload: { newTask, columnId }
      } = action;

      const updatedList = state.boardLists.map(kanbanItem =>
        kanbanItem.id === columnId
          ? { ...kanbanItem, tasks: [...kanbanItem.tasks, newTask] }
          : kanbanItem
      );
      return {
        ...state,
        boardLists: updatedList
      };
    }
    case ADD_NEW_LIST: {
      const {
        payload: { list, columnNo }
      } = action;

      const updatedList = [...state.boardLists];
      updatedList.splice(columnNo - 1, 1, list);

      return {
        ...state,
        boardLists: updatedList,
        openAddListModal: false
      };
    }

    default:
      return state;
  }
};

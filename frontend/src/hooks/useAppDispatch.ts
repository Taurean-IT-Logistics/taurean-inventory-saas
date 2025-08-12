import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { StateManagement } from 'lib';

const useAppDispatch = () => useDispatch<StateManagement.AppDispatch>();

const useAppSelector: TypedUseSelectorHook<StateManagement.RootState> =
  useSelector;

export { useAppDispatch, useAppSelector };

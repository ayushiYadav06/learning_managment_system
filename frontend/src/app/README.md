# LMS Billing – Frontend App

## Component architecture

**All UI components in this app are functional components.** There are no class components (`class … extends React.Component`).

- **Pages & feature components** use the **arrow functional component** pattern with explicit typing:
  - `export const ComponentName: React.FC<Props> = (props) => { … };`
  - State and side effects use **React hooks** (`useState`, `useEffect`, `useCallback`, `useMemo`).
  - Data and mutations use **Redux** and **RTK Query** hooks (`useAppSelector`, `useAppDispatch`, `useGetXQuery`, `useXMutation`).
- **UI primitives** in `components/ui/` are also functional (e.g. `function Button(…) { … }`).

No `this`, `setState`, or lifecycle methods like `componentDidMount` are used; everything is hook-based and function-based.

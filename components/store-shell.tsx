import { StoreHeader } from './store-header'
import { Footer } from './footer'
export function StoreShell({children}:{children:React.ReactNode}){return <><StoreHeader/><main>{children}</main><Footer/></>}

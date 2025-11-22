export function Wrapper({ children }){
    return (
        <div className="h-screen w-screen grid" style={{ gridTemplateRows: "200px 1fr" }}>
            { children }
        </div>
    )
}
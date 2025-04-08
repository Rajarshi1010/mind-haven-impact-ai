import MoodTracker from "./tracker";

export default function Home() {  
    return (
        <>
            <header>
                <div class="logo">MindHaven</div>
                <nav>
                    <a href=''>Home</a>
                    <a href='/chat'>Chat</a>
                    <a href='/journal'>Community</a>
                    <a href='/insight'>Insights</a>
                    <a href='/'>Logout</a>
                </nav>
            </header>

            <section class="hero" style={{ position: "fixed", width: '40vw', top: "25vh", left: '5vw' }}>
                <h1>Welcome to MindHaven</h1>
                <p>Your private space to talk, reflect, and heal. Our AI is here to listen and support you 24/7.</p>
            </section>

            <div style={{ position: "fixed", top: "10vh", left: '60vw' }}>
                <MoodTracker />
            </div>
        </>
    );
}
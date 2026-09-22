import { Link } from "react-router-dom";

const features = [
    ["Discover better", "Search a focused public catalogue of fictional roles with useful filters."],
    ["Move with context", "Keep jobs, candidates, applications, and interviews visible in one workspace."],
    ["Write with care", "Use local, transparent assistance to shape a clearer job brief before publishing."],
];

function Landing() {
    return (
        <div className="landing">
            <section className="landing-hero">
                <div className="hero-copy">
                    <p className="eyebrow accent">Recruitment operations, clarified</p>
                    <h1>Make every hire feel <em>intentional.</em></h1>
                    <p className="hero-lede">A calm workspace for teams that want to discover talent, shape better roles, and keep the hiring process moving.</p>
                    <div className="hero-actions"><Link className="btn btn-primary" to="/jobs">Explore sample roles</Link><Link className="text-link" to="/dashboard">Open recruiter workspace →</Link></div>
                    <p className="demo-note">A fictional, local demo. No accounts or real candidate data required.</p>
                </div>
                <div className="hero-panel" aria-label="Sample recruitment snapshot">
                    <div className="panel-top"><span>Workspace pulse</span><span className="live-dot">Demo data</span></div>
                    <strong>18</strong><span> open roles in motion</span>
                    <div className="mini-bars"><i style={{ height: "52%" }} /><i style={{ height: "78%" }} /><i style={{ height: "64%" }} /><i style={{ height: "92%" }} /><i style={{ height: "70%" }} /></div>
                    <div className="panel-foot"><span>Applications</span><b>42 this month</b></div>
                </div>
            </section>
            <section className="landing-section intro-section"><p className="eyebrow">A single source of momentum</p><h2>Less tab switching. More thoughtful decisions.</h2><p>Jobboard is a recruiter-oriented system that keeps the public experience simple and the operational detail close at hand.</p></section>
            <section className="feature-grid">{features.map(([title, text], index) => <article className="feature-card" key={title}><span className="feature-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</section>
            <section className="workflow-band"><div><p className="eyebrow accent">A better rhythm</p><h2>From brief to shortlist, with the signal intact.</h2></div><ol className="workflow-list"><li><b>Shape</b><span>Create a structured, inclusive role brief.</span></li><li><b>Reach</b><span>Publish a polished opportunity publicly.</span></li><li><b>Decide</b><span>Compare candidates with human judgment in charge.</span></li></ol></section>
            <section className="landing-cta"><p className="eyebrow">Ready when you are</p><h2>See the system in motion.</h2><Link className="btn btn-dark" to="/dashboard">Enter the demo workspace</Link></section>
            <footer className="landing-footer"><span>Jobboard / recruitment operations</span><span>Sample data for demonstration</span></footer>
        </div>
    );
}
export default Landing;

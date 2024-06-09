import Header from '../../components/Header/Header';
import EnterGame from '../../components/EnterGame/EnterGame';
import Footer from '../../components/Footer/Footer';

import cls from './home.module.css';

function Home() {
    return (
        <div>
            <Header label="Stats" href="/stats" />
            <main className="header-above">
                <div className="container main-container">
                    <section className="section">
                        <h2 className="title section-title title-center">これは何？</h2>
                        <p className="paragraph section-paragraph paragraph-center">
                            Geo Guesserのクローン実装である<a href="https://github.com/anonymouspenguin000/geoguessr-clone">geoguessr-clone</a>を
                            <br />対象地域を日本に限定したり、いろいろ変えたやつです。
                        </p>
                        <p className="paragraph section-paragraph title-center">
                            Links:{' '}
                            <a
                                href="https://github.com/anonymouspenguin000/Geoguessr-clone-old"
                                target="_blank"
                                rel="noreferrer"
                            >
                                [original old repo]
                            </a>
                            ;{' '}
                            <a
                                href="https://github.com/anonymouspenguin000/geoguessr-clone"
                                target="_blank"
                                rel="noreferrer"
                            >
                                [original current repo]
                            </a>
                            ;{' '}
                            <a
                                href="https://github.com/sylx/geoguessr-clone"
                                target="_blank"
                                rel="noreferrer"
                            >
                                [my repo]
                            </a>
                        </p>
                    </section>
                    <section className="section">
                        <h2 className="title section-title title-center">Enter the game</h2>
                        <EnterGame className={cls.enter_game} />
                    </section>
                    <section className="section">
                        <h2 className="title section-title title-center">遊び方</h2>
                        <p className="paragraph section-paragraph paragraph-center">
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Home;

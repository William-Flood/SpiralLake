const removeControlState = { prompt: 1, action: 2 };

class MesmerItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { removeControlState: removeControlState.prompt };
        this.showOptions = this.showOptionsTemplate.bind(this);
        this.cancelRemove = this.cancelRemoveTemplate.bind(this);
    }
    showOptionsTemplate(e) {
        e.preventDefault();
        this.setState({ removeControlState: removeControlState.action });
    }
    cancelRemoveTemplate(e) {
        e.preventDefault();
        this.setState({ removeControlState: removeControlState.prompt });
    }
    render() {
        const mesmerNavigateRoute = this.props.navigateUrl + "/" + this.props.mesmer.id;
        let removeButtons;

        if ("userList" == this.props.mode) {
            if (removeControlState.prompt == this.state.removeControlState) {
                removeButtons = (
                    <span>
                        &nbsp;
                        <span className="UI">
                            <a onClick={this.showOptions} href="">Remove</a>
                        </span>
                </span>);
            } else {
                removeButtons = (
                    <span className="UI">
                        &nbsp;
                        <span className="UI">
                            <a onClick={ this.cancelRemove } href="">Cancel</a>&nbsp;
                            <a href={ this.props.removeUrl + "/" + this.props.mesmer.id }>Remove</a>
                        </span>
                    </span>
                );
            }
        } else {
            removeButtons = "";
        }
        return (
            <div className="mesmerItem">
                <a className="playLink" href={mesmerNavigateRoute }><img alt="play" height="48" width="48" src="/img/PlayButton.svg" /></a>
                <a className="titleLink creamText" href={mesmerNavigateRoute} ><strong className="mesmerTitle">{this.props.mesmer.name}</strong></a>
                <span className="mesmerViews tiny UI">&nbsp;{this.props.mesmer.views}&nbsp;</span>
                <span className="mesmerDescription">{this.props.mesmer.description}</span>
                { removeButtons }
            </div>    
        );
    }
}

const loadingSpiralState = {
    hidden: 1,
    appearing: 2
};

class MesmerList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { mesmerList: props.mesmerList, loadingSpiralState: loadingSpiralState.hidden };
        this.setAppearing = this.setAppearingTemplate.bind(this);
        this.spiralTimer = 0;
    }
    setAppearingTemplate() {
        this.setState({ loadingSpiralState: loadingSpiralState.appearing });
    }
    getMesmers(searchText) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.props.queryUrl, true);
        xhr.setRequestHeader("Content-Type", "application/JSON");
        xhr.onload = () => {
            const loadedList = JSON.parse(xhr.responseText);
            clearTimeout(this.spiralTimer);
            this.setState({ mesmerList: loadedList, loadingSpiralState: loadingSpiralState.hidden });
        };
        xhr.send(JSON.stringify(searchText.split(" ")));
        this.spiralTimer = setTimeout(this.setAppearing, 3000);
    }
    componentDidMount() {
        const getMesmersOnPrompt = this.getMesmers.bind(this);
        if ("mainList" == this.props.mode) {
            document.getElementById("txtSearch").addEventListener("keydown", function (e) {
                if (13 == e.keyCode) {
                    getMesmersOnPrompt(document.getElementById("txtSearch").value);
                }
            });
            this.getMesmers(document.getElementById("txtSearch").value);
        }
    }
    render() {
        const mesmerElementsList = this.state.mesmerList.map(mesmerToMap => (
            <MesmerItem key={mesmerToMap.id} mode={this.props.mode} navigateUrl={this.props.navigateUrl} removeUrl={this.props.removeUrl} mesmer={ mesmerToMap } />
        ));
            let spiralClass;
        if ("mainList" == this.props.mode) {
            if (loadingSpiralState.hidden == this.state.loadingSpiralState) {
                spiralClass = "hidden";
            } else if (loadingSpiralState.appearing == this.state.loadingSpiralState) {
                spiralClass = "appearing";
            }
        } else {
            spiralClass = "hidden";
        }
        return (
            <div id="mesmerList" className="creamText">
                <img id="loadingSpiral" key="loadingSpiral" className={spiralClass} alt="Loading" src="/img/LoadingSpiral.svg" />
                { mesmerElementsList }
            </div>
        );
    }
}
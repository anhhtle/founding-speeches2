import React from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actions from '../../actions/';
import DetailBanner from './detail-banner/';
import SpeechesList from './speeches-list/';
import AddSpeechForm from './add-speech-form/';
import Loader from 'react-loader';

import {scrollToTop} from '../../utils';

import './detail-container.css';
import './detail-container-responsive.css';


export class DetailContainer extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            isSpeechFormVisible: false,
            reload: false,
            admin: sessionStorage.admin
        };
    }

    componentDidMount(){
        if(!this.props.actions) return;
        if(typeof this.props.president !== 'object') {
           this.props.actions.loadPresidents();
        }
        this.props.actions.loadPresidentTranscripts(`https://founding-speeches-server.herokuapp.com/api/v1/transcripts/${this.props.match.params.presid}`);
    }

    addSpeechFormOn() {
        
        // auto-scroll to top of page
        scrollToTop(600);

        // show form
        setTimeout(() => {
            this.setState({
                isSpeechFormVisible: true
            });
        }, 610);

        // prevent scrolling
        document.body.className="noscroll";
    }

    addSpeechFormOff(){
        this.setState({
            isSpeechFormVisible: false,
        }, () => {

            // reload page to get new speech
            this.setState({
                reload: !this.reload
            })
        });

        // enable scrolling
        document.body.className="";
    }

    deleteTranscript(id, index){
        this.props.actions.deleteTranscript(id, index)
    }

    render() {
        const { isSpeechFormVisible, admin } = this.state;
        const props = this.props;

        const speechesList = props.transcripts.map((transcript, index) => {
            return <SpeechesList history={props.history} date={transcript.date} title={transcript.title} key={index}
                    presId={props.match.params.presid} index={index} id={transcript._id} delete={(e) => this.deleteTranscript(transcript._id, index)} />
        });

        const { president = {} } = props;

        return (
            <section id="detail-container">
                <DetailBanner banner={president.banner} startYear={president.startYear} endYear={president.endYear} party={president.party} name={president.name} />
                <section className="detail-speeches-list">
                    <Loader loaded={props.loaded} >
                        {speechesList}
                    </ Loader>
                    <button id='detail-button' onClick={() => this.addSpeechFormOn()} className={admin === 'true' ? "btn-add-speech" : "hidden"} >Add a speech</button>
                </section>
                {(isSpeechFormVisible && president.presId) && <AddSpeechForm presId={props.president.presId} onClose={() => this.addSpeechFormOff()}/>}
            </section>
        );
    }
};

const mapDispatchToProps = (dispatch, props) => {
    return {
        actions: bindActionCreators(actions, dispatch),
        dispatch
    };
};

const mapStateToProps = (state, props) => {
    const id = props.match.params.presid;
    return {
        history: props.history,
        president: state.presidents.presidents[id - 1],
        transcripts: state.transcripts.transcripts,
        loaded: state.transcripts.loaded
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailContainer);
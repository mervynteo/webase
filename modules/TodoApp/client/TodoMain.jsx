import { Component, PropTypes } from 'react';
import ReactMixin from 'react-mixin';

import TodoHeader from './components/TodoHeader';
import TodoList from './components/TodoList';

import Tasks from 'TodoApp/collections/Tasks';
import style from './css/TodoApp.import.css';

// Thanks to TrackerReact all our reactive meteor calls render also reactively in react (i.e. user())
@ReactMixin.decorate(TrackerReact)
export default class TodoMain extends Component {

  static propTypes = {
    user: PropTypes.object,
    auth: React.PropTypes.bool
  };

  constructor(props, context) {
    super(props);
    this.state = {
      subscription: {
        tasks: Meteor.subscribe('tasks')
      },
      hideCompleted: false
    }
  }

  componentWillUnmount() {
    this.state.subscription.tasks.stop();
  }

  tasks() {
    let taskFilter = {};

    if (this.state.hideCompleted) {
      taskFilter.checked = {$ne: true};
    }

    return Tasks.find(taskFilter, {sort: {createdAt: -1}}).fetch();
  }

  incompleteCount() {
    let count = Tasks.find({checked: {$ne: true}}).count();

    return count;
  }

  handleToggleHideCompleted(checked) {
    this.setState({hideCompleted: checked});
  }

  render() {

    let content = null;
    if (!Meteor.isServer && !this.state.subscription.tasks.ready()) {
      // loading
      content = (
        <div className="content-block" style={{textAlign: "center"}}>
          <span style={{width:"42px", height:"42px"}} className="preloader"/>
        </div>
      );
    } else {
      content = (
        <TodoList tasks={this.tasks()} user={this.props.user} />
      )
    }

    return (
      <div className="page-content">
        <TodoHeader
          incompleteCount={this.incompleteCount()}
          hideCompleted={this.state.hideCompleted}
          toggleHideCompleted={this.handleToggleHideCompleted.bind(this)}
          user={this.props.user}
          auth={this.props.auth}
        />
        <div className="content-block-title">
          {/* Checks if the user is authenticated. If so, show "re-validating..." until the user object arrives. */}
          {"Todo's " + (this.props.auth ? "(" + (this.props.user ? this.props.user.username : "re-validating...") + ") " : "") }
          <span className="badge">{this.incompleteCount()}</span>
        </div>
        {content}
        <div className="content-block-title">Example Pages</div>
        <div className="list-block">
          <ul>
            <li><a href="/about" className="item-link ajax">
              <div className="item-content">
                <div className="item-inner">
                  <div className="item-title">Example About Page</div>
                </div>
              </div>
            </a></li>
            <li><a href="/form" className="item-link ajax">
              <div className="item-content">
                <div className="item-inner">
                  <div className="item-title">Form Elements</div>
                </div>
              </div>
            </a></li>
          </ul>
        </div>
      </div>
    );
  }
};

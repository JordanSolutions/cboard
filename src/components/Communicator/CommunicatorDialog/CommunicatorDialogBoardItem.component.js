import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import moment from 'moment';
import PublicIcon from '@material-ui/icons/Public';
import KeyIcon from '@material-ui/icons/VpnKey';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import DeleteIcon from '@material-ui/icons/Delete';
import InputIcon from '@material-ui/icons/Input';
import ClearIcon from '@material-ui/icons/Clear';
import HomeIcon from '@material-ui/icons/Home';
import InfoIcon from '@material-ui/icons/Info';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import QueueIcon from '@material-ui/icons/Queue';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';

import IconButton from '../../UI/IconButton';
import { TAB_INDEXES } from './CommunicatorDialog.constants';
import messages from './CommunicatorDialog.messages';
import { isCordova } from '../../../cordova-util';

class CommunicatorDialogBoardItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      menu: null,
      loading: false,
      openBoardInfo: false,
      openDeleteBoard: false,
      openCopyBoard: false
    };
  }

  openMenu(e) {
    this.setState({ menu: e.currentTarget });
  }

  closeMenu() {
    this.setState({ menu: null });
  }

  handleBoardInfoOpen() {
    this.setState({
      openBoardInfo: true
    });
  }

  handleBoardDeleteOpen() {
    this.setState({
      openDeleteBoard: true
    });
  }

  handleBoardCopyOpen() {
    this.setState({
      openCopyBoard: true
    });
  }

  async handleBoardCopy(board) {
    this.setState({
      openCopyBoard: false,
      loading: true
    });
    try {
      await this.props.copyBoard(board);
    } catch (err) {
    } finally {
      this.setState({
        loading: false
      });
    }
  }

  async handleBoardDelete(board) {
    this.setState({
      openDeleteBoard: false,
      loading: true
    });
    try {
      await this.props.deleteMyBoard(board);
    } catch (err) {
    } finally {
      this.setState({
        loading: false
      });
    }
  }

  handleDialogClose() {
    this.setState({
      openBoardInfo: false,
      openCopyBoard: false,
      openDeleteBoard: false
    });
  }

  async setRootBoard(board) {
    await this.props.setRootBoard(board);
    this.setState({ menu: null });
  }

  render() {
    const {
      board,
      selectedTab,
      intl,
      userData,
      communicator,
      activeBoardId,
      addOrRemoveBoard,
      publishBoard
    } = this.props;
    const title = board.name || board.id;
    const displayActions =
      selectedTab === TAB_INDEXES.MY_BOARDS ||
      selectedTab === TAB_INDEXES.PUBLIC_BOARDS ||
      (selectedTab === TAB_INDEXES.COMMUNICATOR_BOARDS && !!userData.authToken);
    // Cordova path cannot be absolute
    const boardCaption =
      isCordova() && board.caption && board.caption.search('/') === 0
        ? `.${board.caption}`
        : board.caption;

    return (
      <div className="CommunicatorDialog__boards__item">
        <div className="CommunicatorDialog__boards__item__image">
          {!!boardCaption && <img src={boardCaption} alt={title} />}
          {!boardCaption && (
            <div className="CommunicatorDialog__boards__item__image__empty">
              <ViewModuleIcon />
            </div>
          )}
        </div>
        <div className="CommunicatorDialog__boards__item__data">
          <div className="CommunicatorDialog__boards__item__data__title">
            <ListItem disableGutters={true}>
              <ListItemText
                primary={title}
                secondary={intl.formatMessage(messages.tilesQty, {
                  qty: board.tiles.length
                })}
              />
            </ListItem>
          </div>
          <div className="CommunicatorDialog__boards__item__data__author">
            {intl.formatMessage(messages.author, { author: board.author })}
          </div>
          <div className="CommunicatorDialog__boards__item__data__date">
            {moment(board.lastEdited).format('DD/MM/YYYY')}
          </div>
          <div className="CommunicatorDialog__boards__item__data__extra">
            {board.isPublic && (
              <Tooltip title={intl.formatMessage(messages.publicBoard)}>
                <PublicIcon />
              </Tooltip>
            )}
            {!board.isPublic && (
              <Tooltip title={intl.formatMessage(messages.privateBoard)}>
                <KeyIcon />
              </Tooltip>
            )}
            {communicator.rootBoard === board.id && (
              <Tooltip title={intl.formatMessage(messages.rootBoard)}>
                <HomeIcon />
              </Tooltip>
            )}
            {activeBoardId === board.id && (
              <Tooltip title={intl.formatMessage(messages.activeBoard)}>
                <RemoveRedEyeIcon />
              </Tooltip>
            )}
          </div>
        </div>
        <div>
          {this.state.loading && <CircularProgress size={25} thickness={7} />}
        </div>
        <div className="CommunicatorDialog__boards__item__actions">
          {displayActions && (
            <div>
              {selectedTab === TAB_INDEXES.COMMUNICATOR_BOARDS && (
                <div>
                  <IconButton
                    disabled={
                      communicator.rootBoard === board.id || !userData.authToken
                    }
                    label={intl.formatMessage(messages.removeBoard)}
                    onClick={() => {
                      addOrRemoveBoard(board);
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                  <IconButton
                    disabled={communicator.rootBoard === board.id}
                    onClick={() => {
                      this.setRootBoard(board);
                    }}
                    label={intl.formatMessage(messages.menuRootBoardOption)}
                  >
                    <HomeIcon />
                  </IconButton>
                </div>
              )}
              {selectedTab === TAB_INDEXES.PUBLIC_BOARDS && (
                <div>
                  <IconButton
                    disabled={
                      communicator.boards.includes(board.id) ||
                      (userData && userData.email === board.email)
                    }
                    onClick={this.handleBoardCopyOpen.bind(this)}
                    label={intl.formatMessage(messages.copyBoard)}
                  >
                    <QueueIcon />
                  </IconButton>
                  <IconButton
                    label={intl.formatMessage(messages.boardInfo)}
                    onClick={this.handleBoardInfoOpen.bind(this)}
                  >
                    <InfoIcon />
                  </IconButton>
                  <Dialog
                    onClose={this.handleDialogClose.bind(this)}
                    aria-labelledby="board-info-title"
                    open={this.state.openBoardInfo}
                  >
                    <DialogTitle
                      id="board-info-title"
                      onClose={this.handleDialogClose.bind(this)}
                    >
                      {board.name}
                    </DialogTitle>
                    <DialogContent>
                      <Typography variant="body1" gutterBottom>
                        <b>{intl.formatMessage(messages.boardInfoName)}:</b>{' '}
                        {board.name}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <b>{intl.formatMessage(messages.boardInfoAuthor)}:</b>{' '}
                        {board.author}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <b>{intl.formatMessage(messages.boardInfoDate)}:</b>{' '}
                        {moment(board.lastEdited).format('DD/MM/YYYY')}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <b>{intl.formatMessage(messages.boardInfoTiles)}:</b>{' '}
                        {board.tiles.length}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <b>{intl.formatMessage(messages.boardInfoId)}:</b>{' '}
                        {board.id}
                      </Typography>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={this.handleDialogClose.bind(this)}
                        color="primary"
                      >
                        {intl.formatMessage(messages.close)}
                      </Button>
                    </DialogActions>
                  </Dialog>

                  <Dialog
                    onClose={this.handleDialogClose.bind(this)}
                    aria-labelledby="board-copy-dialog"
                    open={this.state.openCopyBoard}
                  >
                    <DialogTitle
                      id="board-copy-title"
                      onClose={this.handleDialogClose.bind(this)}
                    >
                      {intl.formatMessage(messages.copyBoard)}
                    </DialogTitle>
                    <DialogContent>
                      {intl.formatMessage(messages.copyBoardDescription)}
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={this.handleDialogClose.bind(this)}
                        color="primary"
                      >
                        {intl.formatMessage(messages.close)}
                      </Button>
                      <Button
                        onClick={() => {
                          this.handleBoardCopy(board);
                        }}
                        color="primary"
                      >
                        {intl.formatMessage(messages.accept)}
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              )}
              {selectedTab === TAB_INDEXES.MY_BOARDS && (
                <div>
                  <IconButton
                    disabled={communicator.rootBoard === board.id}
                    label={
                      communicator.boards.includes(board.id)
                        ? intl.formatMessage(messages.removeBoard)
                        : intl.formatMessage(messages.addBoard)
                    }
                    onClick={() => {
                      addOrRemoveBoard(board);
                    }}
                  >
                    {communicator.boards.includes(board.id) ? (
                      <ClearIcon />
                    ) : (
                      <InputIcon />
                    )}
                  </IconButton>
                  <IconButton
                    label={
                      board.isPublic
                        ? intl.formatMessage(messages.menuUnpublishOption)
                        : intl.formatMessage(messages.menuPublishOption)
                    }
                    onClick={() => {
                      publishBoard(board);
                    }}
                  >
                    {board.isPublic ? <KeyIcon /> : <PublicIcon />}
                  </IconButton>
                  <IconButton
                    disabled={
                      communicator.rootBoard === board.id ||
                      activeBoardId === board.id
                    }
                    label={intl.formatMessage(messages.deleteBoard)}
                    onClick={() => {
                      this.handleBoardDeleteOpen(board);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Dialog
                    onClose={this.handleDialogClose.bind(this)}
                    aria-labelledby="board-delete-dialog"
                    open={this.state.openDeleteBoard}
                  >
                    <DialogTitle
                      id="board-delete-title"
                      onClose={this.handleDialogClose.bind(this)}
                    >
                      {intl.formatMessage(messages.deleteBoard)}
                    </DialogTitle>
                    <DialogContent>
                      {intl.formatMessage(messages.deleteBoardDescription)}
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={this.handleDialogClose.bind(this)}
                        color="primary"
                      >
                        {intl.formatMessage(messages.close)}
                      </Button>
                      <Button
                        onClick={() => {
                          this.handleBoardDelete(board);
                        }}
                        color="primary"
                      >
                        {intl.formatMessage(messages.accept)}
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

CommunicatorDialogBoardItem.propTypes = {
  intl: intlShape,
  communicator: PropTypes.object,
  activeBoardId: PropTypes.string,
  selectedTab: PropTypes.number,
  board: PropTypes.object,
  userData: PropTypes.object,
  copyBoard: PropTypes.func.isRequired,
  addOrRemoveBoard: PropTypes.func.isRequired,
  deleteMyBoard: PropTypes.func.isRequired,
  publishBoard: PropTypes.func.isRequired,
  setRootBoard: PropTypes.func.isRequired,
  showNotification: PropTypes.func.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string)
};

export default CommunicatorDialogBoardItem;

import React from 'react';
import PropTypes from 'prop-types';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip } from 'reactstrap';

export default class BugFiler extends React.Component {
  constructor(props) {
    super(props);

    this.crashRegex = /application crashed \[@ (.+)\]$/g;

    this.state = {
      modal: false,
      parsedLog: null,
      productSearch: null,
      suggestedProducts: [],
      thisFailure: null,
      isFilerSummaryVisible: false,
    };

  }

  cancelFiler() {
    this.props.toggle();
  }

  unhelpfulSummaryReason(summary) {
    // const { searchTerms } = this.props;
    //
    // if (searchTerms.length === 0) {
    //   return "Selected failure does not contain any searchable terms.";
    // }
    // if (searchTerms.every(term => !summary.includes(term))) {
    //   return "Summary does not include the full text of any of the selected failure's search terms:";
    // }
    // return "";
    return summary;
  }

  submitFiler() {
    const { toggle, successCallback } = this.props;
    toggle();
    successCallback();
  }

  render() {
    const {
      isOpen, toggle, suggestion, searchTerms, parsedLog, fullLog, reftestUrl,
    } = this.props;
    const {
      productSearch, suggestedProducts, thisFailure, isFilerSummaryVisible,
    } = this.state;
    const summary = suggestion.search;
    const crash = summary.match(this.crashRegex);
    const crashSignatures = crash ? [crash[0].split("application crashed ")[1]] : [];

    return (
      <div>
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
          <ModalHeader toggle={toggle}>Intermittent Bug Filer</ModalHeader>
          <ModalBody>
            <form id="modalForm">
              <input
                name="modalProductFinderSearch"
                id="modalProductFinderSearch"
                onKeyDown={evt => this.setState({ productSearch: evt.target.value })}
                type="text"
                placeholder="Firefox"
                uib-tooltip="Manually search for a product"
              />
              <button
                name="modalProductFinderButton"
                id="modalProductFinderButton"
                type="button"
                onClick={this.findProduct}
                prevent-default-on-left-click="true"
              >Find Product</button>
              <div>
                {!!productSearch && <div id="productSearchSpinner">
                  <span className="fa fa-spinner fa-pulse th-spinner-lg" />Searching {productSearch}
                </div>}
                <fieldset id="suggestedProducts">
                  {suggestedProducts.map(product => (<div>
                    <input
                      type="radio"
                      value={product}
                      onChange={evt => this.setState({ selectedProduct: evt.target.value })}
                      name="productGroup"
                      id="modalProductSuggestion{$id}"
                    />
                    <label htmlFor="modalProductSuggestion{$id}">{product}</label>
                  </div>))}
                </fieldset>
              </div>

              <div id="failureSummaryGroup" className="collapsed">
                <div id="unhelpfulSummaryReason" ng-show="unhelpfulSummaryReason()">
                  <div>
                    <span
                      className="fa fa-info-circle"
                      id="unhelpful-summary-reason"
                    />Warning: {this.unhelpfulSummaryReason()}
                    <Tooltip target="unhelpful-summary-reason">
                      This can cause poor bug suggestions to be generated
                    </Tooltip>
                  </div>
                  {searchTerms.map(term => <div>{term}</div>)}
                </div>
                <label id="summarylabel" htmlFor="summary">Summary:</label>
                <input
                  id="summary"
                  type="text"
                  placeholder="Intermittent..."
                  pattern=".{0,255}"
                  onChange={evt => this.setState({ summary: evt.target.value })}
                />
                <span id="summaryLength">{summary.length}</span>
                <a
                  className={isFilerSummaryVisible ? 'filersummary-open-btn' : ''}
                  prevent-default-on-left-click="true"
                >
                  {isFilerSummaryVisible && <span>
                    <i
                      onClick={() => this.setState({ isFilerSummaryVisible: !isFilerSummaryVisible })}
                      className="fa fa-chevron-down"
                      id="toggle-failure-lines"
                    />
                    <Tooltip target="toggle-failure-lines">
                      {isFilerSummaryVisible ? "Show all failure lines for this job" : "Hide all failure lines for this job"}
                    </Tooltip>
                    <textarea id="modalFailureList">{thisFailure}</textarea>
                  </span>}
                </a>
              </div>

              <div id="modalLogLinkCheckboxes">
                <label>
                  <input
                    id="modalParsedLog"
                    type="checkbox"
                    onChange={evt => this.setState({ isParsedLog: evt.target.value })}
                  />
                  <a target="_blank" rel="noopener" href={parsedLog}>Include Parsed Log Link</a>
                </label>
                <label>
                  <input
                    id="modalFullLog"
                    type="checkbox"
                    onChange={evt => this.setState({ isFullLog: evt.target.value })}
                  />
                  <a target="_blank" rel="noopener" href={fullLog}>Include Full Log Link</a>
                </label><br />
                {!!reftestUrl && <label id="modalReftestLogLabel">
                  <input
                    id="modalReftestLog"
                    type="checkbox"
                    onChange={evt => this.setState({ isReftest: evt.target.value })}
                  />
                  <a target="_blank" rel="noopener" href={reftestUrl}>Include Reftest Viewer Link</a>
                </label>}
              </div>

              <div id="modalCommentDiv">
                <label id="modalCommentlabel" htmlFor="modalComment">Comment:</label>
                <textarea
                  onChange={evt => this.setState({ comment: evt.target.value })}
                  id="modalComment"
                  type="textarea"
                  placeholder=""
                />
              </div>

              <div id="modalExtras">
                <label>
                  <input
                    id="modalIsIntermittent"
                    onChange={evt => this.setState({ isIntermittent: evt.target.value })}
                    type="checkbox"
                  />
                  This is an intermittent failure
                </label>

                <div id="modalRelatedBugs">
                  <input
                    id="blocks-input"
                    type="text"
                    onChange={evt => this.setState({ blocks: evt.target.value })}
                    placeholder="Blocks"
                  />
                  <Tooltip target="blocks-input" placement="bottom">Comma-separated list of bugs</Tooltip>
                  <input
                    type="text"
                    id="depends-on"
                    onChange={evt => this.setState({ dependsOn: evt.target.value })}
                    placeholder="Depends on"
                  />
                  <Tooltip target="depends-on" placement="bottom">Comma-separated list of bugs</Tooltip>
                  <input
                    id="see-also"
                    type="text"
                    onChange={evt => this.setState({ seeAlso: evt.target.value })}
                    placeholder="See also"
                  />
                  <Tooltip target="see-also" placement="bottom">Comma-separated list of bugs</Tooltip>
                </div>

                {!!crashSignatures.length && <div id="modalCrashSignatureDiv">
                  <label
                    id="modalCrashSignatureLabel"
                    htmlFor="modalCrashSignature"
                  >Signature:</label>
                  <textarea
                    id="modalCrashSignature"
                    onChange={evt => this.setState({ crashSignatures: evt.target.value })}
                    maxLength="2048"
                  />
                </div>}
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.submitFiler}>Submit Bug</Button>{' '}
            <Button color="secondary" onClick={this.cancelFiler}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

BugFiler.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  suggestion: PropTypes.object.isRequired,
  // suggestions: PropTypes.array.isRequired,
  // summary: PropTypes.string.isRequired,
  // searchTerms: PropTypes.string.isRequired,
  fullLog: PropTypes.object.isRequired,
  parsedLog: PropTypes.string.isRequired,
  reftestUrl: PropTypes.string.isRequired,
  successCallback: PropTypes.func.isRequired,
  // selectedJob: PropTypes.object.isRequired,
  // allFailures: PropTypes.array.isRequired,
  // crashSignatures: PropTypes.array,
  searchTerms: PropTypes.array,

  // thisFailure: PropTypes.object.isRequired,
};

BugFiler.defaultProps = {
  crashSignatures: [],
  searchTerms: [],
};

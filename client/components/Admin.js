import React from "react";
import axios from "axios";

//TODO: select for specific pages so you can come back later

class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCollection: false,
      loadingMetadata: false,
      count: 0,
      totalCount: 0,
      page: 1,
      writingToDatabase: false
    };
  }
  getData = async () => {
    const rows = 100;

    // get all identifiers from archive.org
    this.setState({ loadingCollection: true });
    let { data } = await axios.get(
      `https://archive.org/advancedsearch.php?q=collection:gratefuldead&fl=identifier&sort=year+asc&output=json&rows=${rows}&page=${
        this.state.page
      }`
    );

    this.setState({ loadingCollection: false });

    const showIdentifiers = data.response.docs;

    this.setState({ loadingMetadata: true });

    let shows = [];
    for (let i = 0; i < showIdentifiers.length; i++) {
      let res = await axios.get(
        `https://archive.org/metadata/${showIdentifiers[i].identifier}/metadata`
      );

      shows.push({
        identifier: res.data.result.identifier,
        venue: res.data.result.venue,
        location: res.data.result.coverage
      });
      this.setState({ count: shows.length });
    }

    this.setState({ loadingMetadata: false });

    console.log(shows);

    this.setState((state) => {
      return { page: state.page + 1 };
    });

    this.setState({ writingToDatabase: true });

    await axios.post("/api/shows", shows);
    this.setState((state) => {
      return { totalCount: state.totalCount + rows };
    });
    this.setState({ writingToDatabase: false });
  };

  testLocation = async () => {
    let { data } = await axios.get("/api/shows");
    console.log(data);
  };

  render() {
    const {
      writingToDatabase,
      loadingCollection,
      loadingMetadata,
      count,
      totalCount,
      page
    } = this.state;

    return (
      <div>
        {writingToDatabase && <p>WRITING TO DATABASE</p>}
        {count > 0 &&
          this.state.loadingMetadata && (
            <p>{count} shows loaded in current batch</p>
          )}
        {totalCount > 0 && <p>{totalCount} shows completed</p>}
        {loadingMetadata ? <p>LOADING METADATA</p> : null}
        <div>
          {!loadingCollection &&
            !loadingMetadata && (
              <button type="button" onClick={this.getData}>
                Get page {page}
              </button>
            )}
        </div>
        <button type="button" onClick={this.testLocation}>
          Test Location
        </button>
      </div>
    );
  }
}

export default Admin;

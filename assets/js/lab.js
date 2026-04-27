(function () {
  "use strict";

  var searchInput = document.getElementById("snippetSearch");
  var topicFilter = document.getElementById("snippetTopicFilter");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".snippet-card"));
  var emptyState = document.getElementById("snippetEmptyState");

  if (!searchInput || !topicFilter || cards.length === 0) {
    return;
  }

  function normalize(value) {
    return (value || "").toLowerCase().trim();
  }

  function matchesTopic(cardTopics, topic) {
    if (topic === "all") {
      return true;
    }

    return cardTopics.some(function (item) {
      return item === topic;
    });
  }

  function applyFilter() {
    var query = normalize(searchInput.value);
    var selectedTopic = topicFilter.value;
    var visibleCount = 0;

    cards.forEach(function (card) {
      var title = normalize(card.getAttribute("data-title"));
      var body = normalize(card.getAttribute("data-body"));
      var topics = normalize(card.getAttribute("data-topics"))
        .split(",")
        .map(function (topic) {
          return topic.trim();
        })
        .filter(Boolean);

      var inText = query.length === 0 || (title + " " + body).indexOf(query) !== -1;
      var inTopic = matchesTopic(topics, selectedTopic);
      var show = inText && inTopic;

      card.style.display = show ? "block" : "none";
      if (show) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  searchInput.addEventListener("input", applyFilter);
  topicFilter.addEventListener("change", applyFilter);
  applyFilter();
})();

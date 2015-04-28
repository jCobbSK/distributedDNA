/**
 * Settings for DNAAnalysis module.
 * @class Settings
 * @module DNAAnalysis
 */
module.exports = {

  /**
   * Default value for DNAAnalysis.ClusterHandler for ideal sequence length of one cluster.
   * IMPORTANT: if pattern's sequence is greater than optimal it WILL NOT be splitted, cluster size
   * will be the length of pattern's sequence length instead. So it MIGHT happen that optimalClusterSize = 100
   * but real cluster length may be 100 000.
   * @property optimalClusterSize
   * @type {integer}
   * @default 100
   */
  optimalClusterSize: 100,

  /**
   * Cluster - Nodes ratio when module distribute clusters to Node's cache and will send only
   * sample sequence without cluster's patterns.
   * @property clusterNodeRatioForCache
   * @type {float}
   * @default 3
   * @example
   *    3 means that if there are more than 3 clusters on 1 node, we will resend cluster's data with
   *    each request, if less we will re-distribute clusters to all nodes evenly and in requests we
   *    will re-send only sample's sequence
   */
  clusterNodeRatioForCache: 3
}
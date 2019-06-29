let proposalsMaster = [];

const darkmode = new Darkmode();

const menu = new Vue({
    el: '#menu',
    data: {
        isDark: darkmode.isActivated(),
    },
    methods: {
        toggleDark: function(event) {
            darkmode.toggle();
            this.isDark = darkmode.isActivated();
            proposalsInstance.isDark = this.isDark;
        }
    }
});

// 検索フィールド
const searchField = new Vue({
    el: '#searchCondition',
    data: {
        searchWord: '',
        isAdopt: true,
        isNotAdopt: true,
        eventType: undefined, // (orecon|rejectcon),
        talkType: ''
    },
    watch: {
        searchWord: 'filter'
    },
    methods: {
        filter: function(event) {
            let text = this.searchWord;
            let isAdoptValue = this.isAdopt;
            let isNotAdoptValue = this.isNotAdopt;
            let eventType = this.eventType;
            let talkType = this.talkType;

            let isKeywordMatch = function(value) {
                if (text.length > 0) {
                    let words = text.split(/\s+/);
                    return words.filter(word => {
                        let regText = new RegExp(word.trim(), 'i')
                        return regText.test(value.title) ||
                            regText.test(value.user) ||
                            regText.test(value.twitter_id) ||
                            regText.test(value.talk_type);
                    }).length == words.length;
                } else {
                    return true;
                }
            };
            let filteredData = [];
            if (eventType) {
                let isMatchEvent = function(proposal) {
                    return (eventType === 'orecon' && proposal.is_adopted_orecon === true)
                        || (eventType === 'rejectcon' && proposal.is_adopted_rejectcon === true);
                };
                filteredData = proposalsMaster.filter(proposal =>
                    isKeywordMatch(proposal) && isMatchEvent(proposal)
                );
            } else {
                let isAdopted = function(value) {
                    if (isAdoptValue) {
                        return value.is_adopted === true;
                    } else {
                        return false;
                    }
                };
                let isNotAdopted = function(value) {
                    if (isNotAdoptValue) {
                        return value.is_adopted === false;
                    } else {
                        return false;
                    }
                };
                filteredData = proposalsMaster.filter(value =>
                    isKeywordMatch(value)
                        && (isAdopted(value) || isNotAdopted(value))
                );
            }

            if(talkType) {
                let isMatchTalkType = function(proposal) {
                    return (talkType === '')
                        || (talkType === 'LT' && proposal.talk_type === 'LT（5分）')
                        || (talkType === 'LT_R' && proposal.talk_type === 'iOSDCルーキーズ LT（5分）')
                        || (talkType === '15m' && proposal.talk_type === 'レギュラートーク（30分）')
                        || (talkType === '30m' && proposal.talk_type === 'レギュラートーク（60分）')
                        || (talkType === 'iOS' && proposal.talk_type === '技術パッション共有トーク（60分）');
                };
                filteredData = proposalsMaster.filter(proposal =>
                    isKeywordMatch(proposal) && isMatchTalkType(proposal)
                );
            }

            proposalsInstance.proposals = filteredData;
        }
    }
});

// プロポーザル一覧
const proposalsInstance = new Vue({
    el: '#proposals',
    data: {
        proposals: undefined,
        isDark: darkmode.isActivated()
    }
})

const dict = {
    'LT': 'LT（5分）',
    'LT_R': 'iOSDCルーキーズ LT（5分）',
    '15m': 'レギュラートーク（30分）',
    '30m': 'レギュラートーク（60分）',
    'iOS': '技術パッション共有トーク（60分）',
};

// プロポーザル一覧を読み込み
axios.get('/assets/proposals.json')
    .then(function (response) {
        const proposals = response.data;
        proposals.forEach((proposal, index) => {
            proposal.index       = index;
            proposal.talk_type   = dict[proposal.talk_type];
            proposal.twitter_url = 'https://twitter.com/' + proposal.twitter_id;
            proposal.description = proposal.description.replace(/\r\n/g,'<br/>');
        });
        proposalsMaster = proposals;
        proposalsInstance.proposals = proposals;
    })

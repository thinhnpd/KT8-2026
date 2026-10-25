#include <bits/stdc++.h>
using namespace std;
#define ll long long
#define endl '\n'
const ll mod = (ll) 1e9 + 7;

const int len = (int) 2e5 + 36;


int main() {
    ios::sync_with_stdio(0); cin.tie(0); cout.tie(0);
    // #ifndef ONLINE_JUDGE
        // freopen("UNI.INP", "r", stdin);
        // freopen("UNI.OUT", "w", stdout);
    // #endif
    // cerr << "start" << endl;
    
    srand(time(0));

    int n = 16;
    for (int i = 1; i <= n; i++) {
        int num = rand();
        if (num % 2 == 0) cout << char('a' + rand() % ('z' - 'a' + 1));
        else cout << rand() % 10;
    }
    
    // cerr << (1.0 * clock() / CLOCKS_PER_SEC) << 's' << endl;
    return 0;
}
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

type UserAttributes = Partial<Record<string, string>>;

interface UserAttributesContextValue {
    email: string;
    attributes: UserAttributes;
    loading: boolean;
    error?: string;
    refresh: () => Promise<void>;
}

const defaultContextValue: UserAttributesContextValue = {
    email: '',
    attributes: {},
    loading: false,
    refresh: async () => undefined,
};

const UserAttributesContext = createContext<UserAttributesContextValue>(defaultContextValue);

export const UserAttributesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const mountedRef = useRef(true);
    const [email, setEmail] = useState('');
    const [attributes, setAttributes] = useState<UserAttributes>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();

    const resetState = useCallback(() => {
        setEmail('');
        setAttributes({});
        setError(undefined);
    }, []);

    const loadAttributes = useCallback(async () => {
        if (!mountedRef.current) {
            return;
        }

        setLoading(true);
        console.log('🔄 UserAttributesContext: Loading user attributes...');
        try {
            // ユーザーが存在するか確認
            const user = await getCurrentUser();
            console.log('👤 UserAttributesContext: Current user:', user);
            if (!mountedRef.current) {
                return;
            }
            
            if (!user) {
                console.log('❌ UserAttributesContext: No user found');
                resetState();
                return;
            }

            // ユーザー属性を取得
            console.log('📥 UserAttributesContext: Calling fetchUserAttributes...');
            try {
                const fetchedAttributes = await fetchUserAttributes();
                console.log('📋 UserAttributesContext: Fetched attributes:', fetchedAttributes);
                if (!mountedRef.current) {
                    return;
                }
                setAttributes(fetchedAttributes);
                const emailValue = fetchedAttributes.email ?? '';
                setEmail(emailValue);
                console.log('✅ UserAttributesContext: Email set to:', emailValue);
                setError(undefined);
            } catch (attrErr) {
                console.error('❌ UserAttributesContext: fetchUserAttributes failed:', attrErr);
                // email属性がない場合でもusernameを使用
                console.log('⚠️ Using username as fallback');
                const fallbackEmail = user.username || '';
                setEmail(fallbackEmail);
                console.log('✅ UserAttributesContext: Email (fallback) set to:', fallbackEmail);
            }
        } catch (err) {
            console.error('❌ UserAttributesContext: ユーザー属性の取得に失敗しました', err);
            console.error('❌ Error details:', JSON.stringify(err, null, 2));
            if (!mountedRef.current) {
                return;
            }
            resetState();
            const message = err instanceof Error ? err.message : 'ユーザー属性の取得に失敗しました';
            setError(message);
        } finally {
            if (!mountedRef.current) {
                return;
            }
            setLoading(false);
        }
    }, [resetState]);

    useEffect(() => {
        mountedRef.current = true;
        loadAttributes();
        return () => {
            mountedRef.current = false;
        };
    }, [loadAttributes]);

    const value = useMemo<UserAttributesContextValue>(
        () => ({
            email,
            attributes,
            loading,
            error,
            refresh: loadAttributes,
        }),
        [email, attributes, loading, error, loadAttributes],
    );

    return (
        <UserAttributesContext.Provider value={value}>
            {children}
        </UserAttributesContext.Provider>
    );
};

export const useUserAttributes = (): UserAttributesContextValue => {
    return useContext(UserAttributesContext);
};

export const useUserEmail = (): string => {
    const { email } = useUserAttributes();
    return email;
};

